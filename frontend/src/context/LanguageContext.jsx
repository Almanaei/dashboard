import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

// Translations object
const translations = {
  en: {
    // Common
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    all: 'All',
    custom: 'Custom',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    save: 'Save',
    create: 'Create',
    actions: 'Actions',
    email: 'Email',
    notifications: 'Notifications',
    name: 'Name',
    description: 'Description',
    status: 'Status',
    priority: 'Priority',
    title: 'Title',
    content: 'Content',
    address: 'Address',
    dateAndTime: 'Date and Time',
    attachments: 'Attachments',

    // Navigation
    dashboard: 'Dashboard',
    projects: 'Projects',
    reports: 'Reports',
    users: 'Users',
    analytics: 'Analytics',
    extensions: 'Extensions',
    companies: 'Companies',
    helpCenter: 'Help Center',
    notifications: 'Notifications',
    settings: 'Settings',
    security: 'Security',
    backupRestore: 'Backup & Restore',
    profile: 'Profile',
    logout: 'Logout',

    // Projects
    newProject: 'New Project',
    editProject: 'Edit Project',
    planning: 'Planning',
    inProgress: 'In Progress',
    completed: 'Completed',
    onHold: 'On Hold',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    startDate: 'Start Date',
    endDate: 'End Date',
    budget: 'Budget',
    rowsPerPage: 'Rows per Page',
    confirmDelete: 'Confirm Delete',
    deleteProjectConfirmation: 'Are you sure you want to delete project "{name}"?',
    projectSaved: 'Project Saved Successfully',
    projectDeleted: 'Project Deleted Successfully',
    projectCreated: 'Project Created Successfully',

    // Reports
    newReport: 'New Report',
    reportTitle: 'Title',
    reportDescription: 'Description',
    reportType: 'Type',
    reportDate: 'Date',
    attachFiles: 'Attach Files',
    downloadPdf: 'Download PDF',
    editReport: 'Edit Report',
    deleteReport: 'Delete Report',
    createdBy: 'Created By',
    failedToLoadReports: 'Failed to Load Reports',
    reportCreatedSuccessfully: 'Report Created Successfully',
    reportUpdatedSuccessfully: 'Report Updated Successfully',
    reportDeletedSuccessfully: 'Report Deleted Successfully',
    failedToSubmitReport: 'Failed to Submit Report',
    failedToDeleteReport: 'Failed to Delete Report',
    failedToGeneratePDF: 'Failed to Generate PDF',
    pdfGeneratedSuccessfully: 'PDF Generated Successfully',

    // Settings
    language: 'Language',
    english: 'English',
    arabic: 'Arabic',
    theme: 'Theme',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    emailNotifications: 'Email Notifications',
    pushNotifications: 'Push Notifications',
    
    // Misc
    welcome: 'Welcome',
    lastLogin: 'Last Login',
    activity: 'Activity',
    recentActivity: 'Recent Activity',
    viewAll: 'View All',
    noRecords: 'No Records Found',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
    prody: 'Prody',
    getFullAccess: 'Get Full Access',
    starterSetOverview: 'Starter Set Overview',

    // Dashboard Metrics
    sales: 'Sales',
    revenue: 'Revenue',
    deals: 'Deals',
    contact: 'Contact',
    value: 'Value',
    source: 'Source',

    // Users
    users: 'Users',
    createNewUser: 'Create New User',
    editUser: 'Edit User',
    username: 'Username',
    email: 'Email',
    password: 'Password',
    role: 'Role',
    status: 'Status',
    admin: 'Admin',
    user: 'User',
    active: 'Active',
    inactive: 'Inactive',
    usernameTooShort: 'Username must be at least 3 characters',
    passwordTooShort: 'Password must be at least 6 characters',
    userCreatedSuccessfully: 'User created successfully',
    userUpdatedSuccessfully: 'User updated successfully',
    userDeletedSuccessfully: 'User deleted successfully',
    failedToCreateUser: 'Failed to create user',
    failedToUpdateUser: 'Failed to update user',
    failedToDeleteUser: 'Failed to delete user',
    confirmDeleteUser: 'Are you sure you want to delete this user?',
    thisActionCannot: 'This action cannot be undone',
    userNotFound: 'User Not Found',
    firstName: 'First Name',
    lastName: 'Last Name',
    confirmPassword: 'Confirm Password',
    lastActive: 'Last Active',
    createdAt: 'Created At',
    updatedAt: 'Updated At',

    // Project Stats
    totalProjects: 'Total Projects',
    completedProjects: 'Completed Projects',
    inProgressProjects: 'In Progress Projects',
    activeUsers: 'Active Users',
    projectProgress: 'Project Progress',
    projectStats: 'Project Statistics',
    projectOverview: 'Project Overview',

    // Auth
    login: 'Login',
    logout: 'Logout',
    unauthorized: 'Unauthorized Access',
    noPermissionToAccess: 'You do not have permission to access this page',
    backToDashboard: 'Back to Dashboard',
  },
  ar: {
    // Common
    search: 'بحث',
    filter: 'تصفية',
    sort: 'ترتيب',
    all: 'الكل',
    custom: 'مخصص',
    edit: 'تعديل',
    delete: 'حذف',
    cancel: 'إلغاء',
    save: 'حفظ',
    create: 'إنشاء',
    actions: 'الإجراءات',
    email: 'البريد الإلكتروني',
    notifications: 'الإشعارات',
    name: 'الاسم',
    description: 'الوصف',
    status: 'الحالة',
    priority: 'الأولوية',
    title: 'العنوان',
    content: 'المحتوى',
    address: 'العنوان',
    dateAndTime: 'التاريخ والوقت',
    attachments: 'المرفقات',

    // Navigation
    dashboard: 'لوحة التحكم',
    projects: 'المشاريع',
    reports: 'التقارير',
    users: 'المستخدمون',
    analytics: 'التحليلات',
    extensions: 'الامتدادات',
    companies: 'الشركات',
    helpCenter: 'مركز المساعدة',
    notifications: 'الإشعارات',
    settings: 'الإعدادات',
    security: 'الأمان',
    backupRestore: 'النسخ الاحتياطي والاستعادة',
    profile: 'الملف الشخصي',
    logout: 'تسجيل الخروج',

    // Projects
    newProject: 'مشروع جديد',
    editProject: 'تعديل المشروع',
    planning: 'تخطيط',
    inProgress: 'قيد التنفيذ',
    completed: 'مكتمل',
    onHold: 'معلق',
    low: 'منخفض',
    medium: 'متوسط',
    high: 'مرتفع',
    startDate: 'تاريخ البدء',
    endDate: 'تاريخ الانتهاء',
    budget: 'الميزانية',
    rowsPerPage: 'عدد الصفوف في الصفحة',
    confirmDelete: 'تأكيد الحذف',
    deleteProjectConfirmation: 'هل أنت متأكد من حذف المشروع "{name}"؟',
    projectSaved: 'تم حفظ المشروع بنجاح',
    projectDeleted: 'تم حذف المشروع بنجاح',
    projectCreated: 'تم إنشاء المشروع بنجاح',

    // Reports
    newReport: 'تقرير جديد',
    reportTitle: 'العنوان',
    reportDescription: 'الوصف',
    reportType: 'النوع',
    reportDate: 'التاريخ',
    attachFiles: 'إرفاق ملفات',
    downloadPdf: 'تحميل PDF',
    editReport: 'تعديل التقرير',
    deleteReport: 'حذف التقرير',
    createdBy: 'تم إنشاؤه بواسطة',
    failedToLoadReports: 'فشل تحميل التقارير',
    reportCreatedSuccessfully: 'تم إنشاء التقرير بنجاح',
    reportUpdatedSuccessfully: 'تم تحديث التقرير بنجاح',
    reportDeletedSuccessfully: 'تم حذف التقرير بنجاح',
    failedToSubmitReport: 'فشل في إرسال التقرير',
    failedToDeleteReport: 'فشل في حذف التقرير',
    failedToGeneratePDF: 'فشل في إنشاء PDF',
    pdfGeneratedSuccessfully: 'تم إنشاء PDF بنجاح',

    // Settings
    language: 'اللغة',
    english: 'الإنجليزية',
    arabic: 'العربية',
    theme: 'المظهر',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
    emailNotifications: 'إشعارات البريد الإلكتروني',
    pushNotifications: 'الإشعارات الفورية',
    
    // Misc
    welcome: 'مرحباً',
    lastLogin: 'آخر تسجيل دخول',
    activity: 'النشاط',
    recentActivity: 'النشاط الأخير',
    viewAll: 'عرض الكل',
    noRecords: 'لم يتم العثور على سجلات',
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجاح',
    warning: 'تحذير',
    info: 'معلومات',
    prody: 'برودي',
    getFullAccess: 'احصل على الوصول الكامل',
    starterSetOverview: 'نظرة عامة على المجموعة الأولية',

    // Dashboard Metrics
    sales: 'المبيعات',
    revenue: 'الإيرادات',
    deals: 'الصفقات',
    contact: 'جهة الاتصال',
    value: 'القيمة',
    source: 'المصدر',

    // Users
    users: 'المستخدمون',
    createNewUser: 'إنشاء مستخدم جديد',
    editUser: 'تعديل المستخدم',
    username: 'اسم المستخدم',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    role: 'الدور',
    status: 'الحالة',
    admin: 'المشرف',
    user: 'المستخدم',
    active: 'نشط',
    inactive: 'غير نشط',
    usernameTooShort: 'يجب أن يكون اسم المستخدم على الأقل 3 أحرف',
    passwordTooShort: 'يجب أن تكون كلمة المرور على الأقل 6 أحرف',
    userCreatedSuccessfully: 'تم إنشاء المستخدم بنجاح',
    userUpdatedSuccessfully: 'تم تحديث المستخدم بنجاح',
    userDeletedSuccessfully: 'تم حذف المستخدم بنجاح',
    failedToCreateUser: 'فشل في إنشاء المستخدم',
    failedToUpdateUser: 'فشل في تحديث المستخدم',
    failedToDeleteUser: 'فشل في حذف المستخدم',
    confirmDeleteUser: 'هل أنت متأكد من حذف هذا المستخدم؟',
    thisActionCannot: 'لا يمكن التراجع عن هذه الإجراء',
    userNotFound: 'المستخدم غير موجود',
    firstName: 'الاسم الأول',
    lastName: 'الاسم الأخير',
    confirmPassword: 'تأكيد كلمة المرور',
    lastActive: 'آخر نشاط',
    createdAt: 'تم إنشاؤه في',
    updatedAt: 'تم تحديثه في',

    // Project Stats
    totalProjects: 'إجمالي المشاريع',
    completedProjects: 'المشاريع المكتملة',
    inProgressProjects: 'المشاريع قيد التنفيذ',
    activeUsers: 'المستخدمون النشطون',
    projectProgress: 'تقدم المشروع',
    projectStats: 'إحصائيات المشروع',
    projectOverview: 'نظرة عامة على المشروع',

    // Auth
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    unauthorized: 'وصول غير مصرح به',
    noPermissionToAccess: 'ليس لديك صلاحية الوصول إلى هذه الصفحة',
    backToDashboard: 'العودة إلى لوحة التحكم',
  }
};

// Custom hook to use the language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Language Provider component
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'en';
  });
  const [isRTL, setIsRTL] = useState(language === 'ar');

  useEffect(() => {
    setIsRTL(language === 'ar');
    document.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  const value = {
    language,
    setLanguage,
    isRTL,
    t,
    toggleLanguage
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
