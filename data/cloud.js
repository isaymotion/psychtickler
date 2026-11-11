/* Cloud sync settings. The Firebase web config is not a secret: access is controlled by the security rules in
   firestore.rules. Psych Tickler shares the Batch Tickler Firebase project ("batch-tickler") but keeps everything
   under its own top-level space, programs/{code}/…, so the two apps never read each other's data.
   owners: the account(s) that can create the department space and name other admins. Keep this list in step with
   isOwner() in firestore.rules. Everyone else who is an admin is named inside the database (Cloud sync > Admins). */
window.CLOUD_CONFIG = {
  firebase: {
    apiKey: 'AIzaSyCPGCe84bMyj3aZnLRfrLwSFKy3AI1QtgY',
    authDomain: 'batch-tickler.firebaseapp.com',
    projectId: 'batch-tickler',
    storageBucket: 'batch-tickler.firebasestorage.app',
    messagingSenderId: '356707405669',
    appId: '1:356707405669:web:cbc941c3629bdf0444db8c'
  },
  root: 'programs',
  admins: ['isaymotion@gmail.com'],
  // Card groups that leave the phone only when their owner ticks the consent box on the Cloud sync screen.
  privateGroups: ['emergency', 'contact'],
  // Chat photos are stored inside the message; keep them small so the shared free quota lasts, and clear old ones.
  chatImgMax: 400000,        // characters of the data URL, about 300 KB of picture
  chatImgKeepDays: 90
};
