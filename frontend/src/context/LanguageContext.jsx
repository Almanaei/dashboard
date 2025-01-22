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

    // Navigation
    dashboard: 'Dashboard',
    projects: 'Projects',
    reports: 'Reports',
    users: 'Users',
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
    rowsPerPage: 'Rows per page',
    confirmDelete: 'Confirm Delete',
    deleteProjectConfirmation: 'Are you sure you want to delete project "{name}"?',
    projectSaved: 'Project saved successfully',
    projectDeleted: 'Project deleted successfully',
    projectCreated: 'Project created successfully',
    name: 'Name',
    description: 'Description',
    status: 'Status',
    priority: 'Priority',

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
    source: 'Source'
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

    // Navigation
    dashboard: 'لوحة التحكم',
    projects: 'المشاريع',
    reports: 'التقارير',
    users: 'المستخدمون',
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
    name: 'الاسم',
    description: 'الوصف',
    status: 'الحالة',
    priority: 'الأولوية',

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
    source: 'المصدر'
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
