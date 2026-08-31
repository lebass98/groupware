/**
 * Firebase Firestore Batch Seeding Script
 * 
 * 구글 파이어베이스(Firebase Firestore) 프로젝트 연동 시 
 * firebase-seed.json 데이터를 Firestore 데이터베이스로 자동 배치 입력(Upload)하는 유틸리티 코드입니다.
 * 
 * [ 사용방법 예시 ]
 * import { initializeApp } from "firebase/app";
 * import { getFirestore } from "firebase/firestore";
 * import { seedFirebaseFirestore } from "./data/firebase-seeder.js";
 * 
 * const firebaseConfig = { ... }; // 본인 Firebase 콘솔 설정
 * const app = initializeApp(firebaseConfig);
 * const db = getFirestore(app);
 * 
 * await seedFirebaseFirestore(db);
 */

export async function seedFirebaseFirestore(db, seedUrl = './data/firebase-seed.json') {
  try {
    const response = await fetch(seedUrl);
    const seedData = await response.json();
    console.log("🚀 Firebase 시드 데이터 로드 성공:", seedData._meta);

    const { doc, setDoc, writeBatch, collection } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");

    // 1. 임직원 (employees) 컬렉션 시딩
    if (seedData.employees && Array.isArray(seedData.employees)) {
      const batch = writeBatch(db);
      seedData.employees.forEach(emp => {
        const empRef = doc(db, "employees", String(emp.id));
        batch.set(empRef, emp);
      });
      await batch.commit();
      console.log(`✅ [Firestore] 'employees' 컬렉션 (${seedData.employees.length}건) 시딩 완료`);
    }

    // 2. 공지사항 (notices) 컬렉션 시딩
    if (seedData.notices && Array.isArray(seedData.notices)) {
      const batch = writeBatch(db);
      seedData.notices.forEach(notice => {
        const noticeRef = doc(db, "notices", String(notice.id));
        batch.set(noticeRef, notice);
      });
      await batch.commit();
      console.log(`✅ [Firestore] 'notices' 컬렉션 (${seedData.notices.length}건) 시딩 완료`);
    }

    // 3. 할 일 (todos) 컬렉션 시딩
    if (seedData.todos && Array.isArray(seedData.todos)) {
      const batch = writeBatch(db);
      seedData.todos.forEach(todo => {
        const todoRef = doc(db, "todos", String(todo.id));
        batch.set(todoRef, todo);
      });
      await batch.commit();
      console.log(`✅ [Firestore] 'todos' 컬렉션 (${seedData.todos.length}건) 시딩 완료`);
    }

    // 4. 일정 (schedules) 문서 시딩
    if (seedData.schedules) {
      const batch = writeBatch(db);
      Object.entries(seedData.schedules).forEach(([dateKey, items]) => {
        const schRef = doc(db, "schedules", dateKey);
        batch.set(schRef, { date: dateKey, items });
      });
      await batch.commit();
      console.log(`✅ [Firestore] 'schedules' 컬렉션 시딩 완료`);
    }

    // 5. 근태 및 출퇴근 (attendance) 시딩
    if (seedData.attendance) {
      await setDoc(doc(db, "attendance", "officeLocation"), seedData.attendance.officeLocation);
      const batch = writeBatch(db);
      seedData.attendance.logs.forEach(log => {
        const logRef = doc(db, "attendance_logs", String(log.id));
        batch.set(logRef, log);
      });
      await batch.commit();
      console.log(`✅ [Firestore] 'attendance' & 'attendance_logs' 컬렉션 시딩 완료`);
    }

    // 6. 임직원 접근 명부 (members) 시딩
    //    보안 규칙이 '사전 등록된 임직원'인지 판별하는 근거 데이터입니다.
    //    이 명부에 없는 계정은 로그인에 성공하더라도 어떤 데이터도 읽을 수 없습니다.
    if (seedData.employees && Array.isArray(seedData.employees)) {
      const batch = writeBatch(db);
      const registered = new Set();
      seedData.employees.forEach(emp => {
        const email = String(emp.email || '').trim().toLowerCase();
        if (!email || registered.has(email)) return;
        registered.add(email);
        batch.set(doc(db, "members", email), {
          email,
          name: emp.name,
          dept: emp.dept,
          role: emp.role,
          employeeId: emp.id
        });
      });
      await batch.commit();
      console.log(`✅ [Firestore] 'members' 접근 명부 (${registered.size}건) 시딩 완료`);
    }

    // 7. 경비 및 결재 (finance) 시딩
    if (seedData.finance && seedData.finance.expenses) {
      await setDoc(doc(db, "finance", "expenses"), seedData.finance.expenses);
      console.log(`✅ [Firestore] 'finance' 데이터 문서 시딩 완료`);
    }

    console.log("🎉 모든 Firebase Firestore 시딩 작업이 성공적으로 마무리되었습니다!");
    return true;
  } catch (error) {
    console.error("❌ Firebase 시딩 중 오류가 발생했습니다:", error);
    throw error;
  }
}
