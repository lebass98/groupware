/**
 * Firestore 배치 시딩 유틸리티
 *
 * data/firebase-seed.json(= data/build-seed.js가 mockData.js에서 생성한 산출물)을
 * Firestore로 일괄 업로드한다.
 *
 * 설계 원칙
 *  1. 시드 파일에 있는 항목만 올린다. 이 파일이 데이터를 재가공하지 않는다.
 *     (예전 구현은 members를 여기서 다시 계산했는데, 그러면 생성 규칙이 두 곳으로 갈라진다.
 *      이제 members도 build-seed.js가 만들어 둔 것을 그대로 올린다.)
 *  2. 컬렉션별 업로드 방식을 표(SPEC)로 선언한다. 항목이 늘어도 표만 고치면 된다.
 *  3. Firestore 배치는 1회 500건 제한이 있으므로 청크로 나눠 커밋한다.
 *  4. 실패해도 어느 컬렉션에서 멈췄는지 로그로 남긴다.
 *
 * 사용법: firebase/seed.html을 관리자 계정으로 열어 실행한다.
 */

const BATCH_LIMIT = 450; // 500 제한에 여유를 둔다.

/**
 * 시드 키 -> Firestore 반영 방식 선언표.
 *
 *  kind 'docs'   : 배열의 각 원소를 개별 문서로 저장. id()로 문서 ID를 정한다.
 *  kind 'map'    : 객체의 각 (키,값)을 개별 문서로 저장. wrap()으로 저장 형태를 정한다.
 *  kind 'single' : 값 전체를 문서 하나에 저장.
 */
const SPEC = [
  // --- 임직원 및 접근 통제 ---
  { key: 'employees', kind: 'docs', collection: 'employees', id: (e) => String(e.id) },
  { key: 'members', kind: 'docs', collection: 'members', id: (m) => String(m.email).trim().toLowerCase() },

  // --- 공용 콘텐츠 ---
  { key: 'notices', kind: 'docs', collection: 'notices', id: (n) => String(n.id) },
  { key: 'todos', kind: 'docs', collection: 'todos', id: (t) => String(t.id) },
  { key: 'trashedTodos', kind: 'docs', collection: 'trashed_todos', id: (t) => String(t.id) },
  { key: 'projects', kind: 'docs', collection: 'projects', id: (p) => String(p.id) },
  { key: 'notifications', kind: 'docs', collection: 'notifications', id: (n) => String(n.id) },

  // --- 업무 보고 3종 ---
  { key: 'workReports', kind: 'docs', collection: 'work_reports', id: (r) => String(r.id) },
  { key: 'dailyWorkReports', kind: 'docs', collection: 'daily_work_reports', id: (r) => String(r.id) },
  { key: 'teamWorkReports', kind: 'docs', collection: 'team_work_reports', id: (r) => String(r.id) },

  // --- 일정 및 달력 ---
  { key: 'schedules', kind: 'map', collection: 'schedules', wrap: (date, items) => ({ date, items }) },
  { key: 'observances', kind: 'single', collection: 'calendar', doc: 'observances' },
  { key: 'solarTerms', kind: 'single', collection: 'calendar', doc: 'solarTerms' },

  // --- 근태 / 재무 / 기타 ---
  { key: 'attendance', kind: 'single', collection: 'attendance', doc: 'config' },
  { key: 'finance', kind: 'single', collection: 'finance', doc: 'expenses' },
  { key: 'recentProjects', kind: 'single', collection: 'meta', doc: 'recentProjects', box: (v) => ({ items: v }) }
];

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function seedFirebaseFirestore(db, seedUrl = './data/firebase-seed.json') {
  const { doc, setDoc, writeBatch } = await import(
    'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js'
  );

  const response = await fetch(seedUrl);
  if (!response.ok) {
    throw new Error(`시드 파일을 불러오지 못했습니다 (${response.status}). 경로: ${seedUrl}`);
  }
  const seed = await response.json();
  console.log('🚀 시드 데이터 로드 성공:', JSON.stringify(seed._meta));

  let totalDocs = 0;
  const summary = [];

  for (const spec of SPEC) {
    const value = seed[spec.key];
    if (value === undefined || value === null) {
      console.warn(`⏭️  '${spec.key}' 항목이 시드에 없어 건너뜁니다.`);
      continue;
    }

    try {
      if (spec.kind === 'single') {
        const payload = spec.box ? spec.box(value) : value;
        await setDoc(doc(db, spec.collection, spec.doc), payload);
        totalDocs += 1;
        summary.push(`${spec.collection}/${spec.doc}`);
        console.log(`✅ ${spec.collection}/${spec.doc} 저장 완료`);
        continue;
      }

      // docs / map 은 여러 문서를 배치로 나눠 쓴다.
      let entries;
      if (spec.kind === 'docs') {
        if (!Array.isArray(value)) throw new Error(`'${spec.key}'는 배열이어야 합니다.`);
        entries = value.map((item) => [spec.id(item), item]);
      } else {
        entries = Object.entries(value).map(([k, v]) => [k, spec.wrap ? spec.wrap(k, v) : v]);
      }

      for (const part of chunk(entries, BATCH_LIMIT)) {
        const batch = writeBatch(db);
        part.forEach(([id, data]) => batch.set(doc(db, spec.collection, id), data));
        await batch.commit();
      }

      totalDocs += entries.length;
      summary.push(`${spec.collection}(${entries.length})`);
      console.log(`✅ '${spec.collection}' 컬렉션 ${entries.length}건 시딩 완료`);
    } catch (error) {
      console.error(`❌ '${spec.key}' 시딩 중 오류: ${error.message}`);
      throw error;
    }
  }

  console.log(`\n🎉 시딩 완료 — 총 ${totalDocs}건`);
  console.log(`   ${summary.join(', ')}`);
  return { totalDocs, collections: summary };
}
