import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

// Translations object
const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    reports: 'Reports',
    users: 'Users',
    settings: 'Settings',
    security: 'Security',
    backup: 'Backup & Restore',
    logout: 'Logout',
    
    // Common Actions
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    create: 'Create',
    add: 'Add',
    search: 'Search',
    download: 'Download',
    share: 'Share',
    manage: 'Manage',
    
    // Settings
    language: 'Language',
    theme: 'Theme',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    notifications: 'Notifications',
    emailNotifications: 'Email Notifications',
    pushNotifications: 'Push Notifications',
    
    // Security
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    passwordsDoNotMatch: 'Passwords do not match',
    passwordChanged: 'Password changed successfully',
    twoFactorAuth: 'Two-Factor Authentication',
    enableTwoFactor: 'Enable Two-Factor Authentication',
    twoFactorEnabled: 'Two-factor authentication enabled',
    twoFactorDisabled: 'Two-factor authentication disabled',
    twoFactorDescription: 'Add an extra layer of security to your account',
    
    // Reports
    reports: 'Reports',
    newReport: 'New Report',
    reportTitle: 'Title',
    reportContent: 'Content',
    reportAddress: 'Address',
    reportDateAndTime: 'Date & Time',
    reportAttachments: 'Attachments',
    reportActions: 'Actions',
    reportDate: 'Date',
    reportTime: 'Time',
    attachFiles: 'Attach Files',
    downloadPdf: 'Download PDF',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    save: 'Save',
    create: 'Create',
    editReport: 'Edit Report',
    deleteReport: 'Delete Report',
    deleteReportConfirmation: 'Are you sure you want to delete the report "{title}"?',
    attachmentName: '{name} ({size} KB)',
    reportTitleValue: '{title}',
    reportContentValue: '{content}',
    reportAddressValue: '{address}',
    reportDateTime: '{date} {time}',
    
    // Users
    addUser: 'Add User',
    editUser: 'Edit User',
    deleteUser: 'Delete User',
    deleteUserConfirmation: 'Are you sure you want to delete {name}?',
    name: 'Name',
    email: 'Email',
    role: 'Role',
    status: 'Status',
    lastLogin: 'Last Login',
    actions: 'Actions',
    admin: 'Admin',
    user: 'User',
    active: 'Active',
    inactive: 'Inactive',
    password: 'Password',
    username: 'Username',
    
    // Backup
    createBackup: 'Create Backup',
    restoreBackup: 'Restore Backup',
    backupCreated: 'Backup created successfully',
    backupRestored: 'Backup restored successfully',
    backupDeleted: 'Backup deleted successfully',
    backupError: 'Error creating backup',
    restoreError: 'Error restoring backup',
    deleteError: 'Error deleting backup',
    downloadError: 'Error downloading backup',
    backupFromDate: 'Backup from {date}',
    backupSize: 'Size: {size}',
    availableBackups: 'Available Backups',
    restore: 'Restore',
    
    // Misc
    welcome: 'Welcome',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    prody: 'Prody',
    getFullAccess: 'Get Full Access',
    starterSetOverview: 'Starter Set Overview',
  },
  ar: {
    // Navigation
    dashboard: 'لوحة التحكم',
    reports: 'التقارير',
    projects: 'المشاريع',
    analytics: 'التحليلات',
    extensions: 'الإضافات',
    companies: 'الشركات',
    users: 'المستخدمون',
    helpCenter: 'مركز المساعدة',
    notifications: 'الإشعارات',
    
    // Common Actions
    edit: 'تعديل',
    delete: 'حذف',
    save: 'حفظ',
    cancel: 'إلغاء',
    create: 'إنشاء',
    add: 'إضافة',
    search: 'بحث',
    download: 'تحميل',
    share: 'مشاركة',
    manage: 'إدارة',
    
    // Settings
    language: 'اللغة',
    theme: 'المظهر',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
    notifications: 'الإشعارات',
    emailNotifications: 'إشعارات البريد الإلكتروني',
    pushNotifications: 'الإشعارات الفورية',
    
    // Security
    changePassword: 'تغيير كلمة المرور',
    currentPassword: 'كلمة المرور الحالية',
    newPassword: 'كلمة المرور الجديدة',
    confirmPassword: 'تأكيد كلمة المرور',
    passwordsDoNotMatch: 'كلمات المرور غير متطابقة',
    passwordChanged: 'تم تغيير كلمة المرور بنجاح',
    twoFactorAuth: 'المصادقة الثنائية',
    enableTwoFactor: 'تفعيل المصادقة الثنائية',
    twoFactorEnabled: 'تم تفعيل المصادقة الثنائية',
    twoFactorDisabled: 'تم تعطيل المصادقة الثنائية',
    twoFactorDescription: 'أضف طبقة حماية إضافية لحسابك',
    
    // Reports
    reports: 'التقارير',
    newReport: 'تقرير جديد',
    reportTitle: 'العنوان',
    reportContent: 'المحتوى',
    reportAddress: 'العنوان',
    reportDateAndTime: 'التاريخ والوقت',
    reportAttachments: 'المرفقات',
    reportActions: 'الإجراءات',
    reportDate: 'التاريخ',
    reportTime: 'الوقت',
    attachFiles: 'إرفاق ملفات',
    downloadPdf: 'تحميل PDF',
    edit: 'تعديل',
    delete: 'حذف',
    cancel: 'إلغاء',
    save: 'حفظ',
    create: 'إنشاء',
    editReport: 'تعديل التقرير',
    deleteReport: 'حذف التقرير',
    deleteReportConfirmation: 'هل أنت متأكد من حذف التقرير "{title}"؟',
    attachmentName: '{name} ({size} ك.ب)',
    reportTitleValue: '{title}',
    reportContentValue: '{content}',
    reportAddressValue: '{address}',
    reportDateTime: '{date} {time}',
    
    // Users
    addUser: 'إضافة مستخدم',
    editUser: 'تعديل المستخدم',
    deleteUser: 'حذف المستخدم',
    deleteUserConfirmation: 'هل أنت متأكد من حذف {name}؟',
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    role: 'الدور',
    status: 'الحالة',
    lastLogin: 'آخر تسجيل دخول',
    actions: 'الإجراءات',
    admin: 'مدير',
    user: 'مستخدم',
    active: 'نشط',
    inactive: 'غير نشط',
    password: 'كلمة المرور',
    username: 'اسم المستخدم',
    
    // Backup
    createBackup: 'إنشاء نسخة احتياطية',
    restoreBackup: 'استعادة النسخة الاحتياطية',
    backupCreated: 'تم إنشاء النسخة الاحتياطية بنجاح',
    backupRestored: 'تم استعادة النسخة الاحتياطية بنجاح',
    backupDeleted: 'تم حذف النسخة الاحتياطية بنجاح',
    backupError: 'خطأ في إنشاء النسخة الاحتياطية',
    restoreError: 'خطأ في استعادة النسخة الاحتياطية',
    deleteError: 'خطأ في حذف النسخة الاحتياطية',
    downloadError: 'خطأ في تحميل النسخة الاحتياطية',
    backupFromDate: 'نسخة احتياطية من {date}',
    backupSize: 'الحجم: {size}',
    availableBackups: 'النسخ الاحتياطية المتوفرة',
    restore: 'استعادة',
    
    // Dashboard Metrics
    sales: 'المبيعات',
    profit: 'الأرباح',
    customers: 'العملاء',
    revenues: 'الإيرادات',
    expenditures: 'المصروفات',
    consolidated_budget: 'الميزانية الموحدة',
    
    // Dashboard Actions
    add_new: 'إضافة جديد',
    filter: 'تصفية',
    sort: 'ترتيب',
    search: 'بحث',
    all: 'الكل',
    custom: 'مخصص',
    
    // Table Headers
    id: 'المعرف',
    deals: 'الصفقات',
    contact: 'جهة الاتصال',
    email: 'البريد الإلكتروني',
    value: 'القيمة',
    source: 'المصدر',
    
    // Company Info
    house_spectrum_ltd: 'هاوس سبكتروم المحدودة',
    certified: 'معتمد',
    jessica_parker: 'جيسيكا باركر',
    edited_7_hrs_ago: 'تم التعديل قبل 7 ساعات',
    
    // Misc
    welcome: 'مرحباً',
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجاح',
    prody: 'برودي',
    getFullAccess: 'احصل على الوصول الكامل',
    starterSetOverview: 'نظرة عامة على المجموعة الأولية',
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
export default function LanguageProvider({ children }) {
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
