const commentsData = [
    { id: 1, taskid: 1, entrydate: "2025-02-14T10:15:30.000Z", comment: "Great work on the project!", file: null, user: { name: "John Doe", avatar: null } },
    { id: 2, taskid: 1, entrydate: "2025-02-14T12:00:00.000Z", comment: "We need to review the latest milestone.", file: "https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/avatars/10.png", user: { name: "Jane Smith", avatar: "https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/avatars/7.png" } },
    { id: 3, taskid: 2, entrydate: "2025-02-15T08:30:00.000Z", comment: "Any updates on the testing phase?", file: null, user: { name: "Michael Lee", avatar: "https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/avatars/3.png" } },
    { id: 4, taskid: 2, entrydate: "2025-02-15T09:00:00.000Z", comment: "We should schedule a meeting for review.", file: null, user: { name: "Emily Clark", avatar: null } },
    { id: 5, taskid: 3, entrydate: "2025-02-15T09:30:00.000Z", comment: "Make sure to document the latest changes.", file: "https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/avatars/2.png", user: { name: "Robert Johnson", avatar: "https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/avatars/8.png" } },
    { id: 6, taskid: 3, entrydate: "2025-02-15T10:15:00.000Z", comment: "Can we speed up the UI changes?", file: null, user: { name: "Sophia Davis", avatar: "https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/avatars/2.png" } },
    { id: 7, taskid: 4, entrydate: "2025-02-15T11:00:00.000Z", comment: "Adding more test cases today.", file: null, user: { name: "Daniel Brown", avatar: "	https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/avatars/5.png" } },
    { id: 8, taskid: 4, entrydate: "2025-02-15T11:45:00.000Z", comment: "We need more API test coverage.", file: null, user: { name: "Olivia Wilson", avatar: "https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/avatars/2.png" } },
    { id: 9, taskid: 5, entrydate: "2025-02-15T12:30:00.000Z", comment: "Deployment is scheduled for next Monday.", file: null, user: { name: "Liam Martinez", avatar: null } },
    { id: 10, taskid: 5, entrydate: "2025-02-15T13:00:00.000Z", comment: "Please review the new documentation.", file: "https://example.com/doc.pdf", user: { name: "Emma Taylor", avatar: "https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/avatars/8.png" } },
    { id: 11, taskid: 6, entrydate: "2025-02-15T13:30:00.000Z", comment: "Database migration is complete.", file: null, user: { name: "Mason Anderson", avatar: null } },
    { id: 12, taskid: 6, entrydate: "2025-02-15T14:00:00.000Z", comment: "Security review scheduled for tomorrow.", file: null, user: { name: "Ava Thomas", avatar: "https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/avatars/7.png" } },
    { id: 13, taskid: 7, entrydate: "2025-02-15T14:30:00.000Z", comment: "We found a bug in the auth system.", file: null, user: { name: "William Moore", avatar: "https://example.com/avatar8.jpg" } },
    { id: 14, taskid: 7, entrydate: "2025-02-15T15:00:00.000Z", comment: "Bug fix deployed, please verify.", file: null, user: { name: "Isabella Hall", avatar: "https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/avatars/10.png" } },
    { id: 15, taskid: 8, entrydate: "2025-02-15T15:30:00.000Z", comment: "UX feedback is mostly positive.", file: null, user: { name: "James White", avatar: "https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/avatars/9.png" } },
    { id: 16, taskid: 8, entrydate: "2025-02-15T16:00:00.000Z", comment: "UI changes approved by the client.", file: null, user: { name: "Charlotte Harris", avatar: "https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/avatars/2.png" } },
    { id: 17, taskid: 9, entrydate: "2025-02-15T16:30:00.000Z", comment: "Performance tests running.", file: null, user: { name: "Benjamin Young", avatar: "https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/avatars/9.png" } },
    { id: 18, taskid: 9, entrydate: "2025-02-15T17:00:00.000Z", comment: "Server optimization complete.", file: null, user: { name: "Mia King", avatar: "https://example.com/avatar11.jpg" } },
    { id: 19, taskid: 10, entrydate: "2025-02-15T17:30:00.000Z", comment: "Final testing phase is underway.", file: null, user: { name: "Ethan Scott", avatar: "https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/avatars/9.png" } },
    { id: 20, taskid: 10, entrydate: "2025-02-15T18:00:00.000Z", comment: "Release candidate build ready.", file: null, user: { name: "Harper Nelson", avatar: null } },
];

export default commentsData;
