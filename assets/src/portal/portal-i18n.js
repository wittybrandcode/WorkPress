/**
 * WorkPress Portal Internationalization & Localization Engine (portal-i18n.js)
 *
 * Standalone & WordPress-integrated i18n subsystem:
 * - English as base source string standard (msgid)
 * - 1st-class comprehensive Arabic & French translation dictionaries
 * - Reactive language switcher with instant DOM dir & font updates
 * - Full compatibility with window.wp.i18n and offline fallback
 *
 * @package WorkPress
 * @subpackage Portal/i18n
 * @version 2.3.0
 */

(function() {
    'use strict';

    // 1. Master Translation Dictionaries
    const DICTIONARIES = {
        ar: {
            // General & Common
            "WorkPress": "ورك برس",
            "Client Portal": "بوابة المستفيد",
            "Active Projects": "المشاريع الجارية",
            "Deliverables Vault": "خزانة المخرجات المعتمدة",
            "Project Requests": "سجل الطلبات والمقترحات",
            "Official Delivery Certificate": "وثيقة الاستلام الرسمية للمشروع",
            "Submit New Request": "تقديم طلب مشروع",
            "Submit Request": "إرسال الطلب",
            "New Request": "طلب جديد",
            "Executive Dashboard": "لوحة القيادة والمتابعة",
            "Main Overview": "الرئيسية",
            "Sign In": "تسجيل الدخول",
            "Logout": "تسجيل الخروج",
            "Language": "اللغة",
            "Search": "بحث",
            "Filter": "تصفية",
            "Loading...": "جاري التحميل...",
            "Cancel": "إلغاء",
            "Confirm": "تأكيد",
            "Save": "حفظ",
            "Back": "رجوع",
            "Next": "التالي",
            "Previous": "السابق",
            "Close": "إغلاق",
            "View": "معاينة",
            "Download": "تحميل",
            "Print": "طباعة",
            "Status": "الحالة",
            "Priority": "الأولوية",
            "Date": "التاريخ",
            "Due Date": "موعد التسليم",
            "Lead": "المسؤول الفني",
            "Assignees": "المكلفون",
            "Total": "الإجمالي",
            "Progress": "نسبة الإنجاز",
            "Deliverables": "المخرجات",
            "Tasks": "المهام",

            // Status Filters & Badges
            "All Projects": "جميع المشاريع",
            "In Progress": "قيد التنفيذ والإنجاز",
            "Under Review / Pending": "قيد الدراسة والانتظار",
            "Approved": "المعتمدة حديثاً",
            "Completed": "المكتملة والمنجزة",
            "Frozen / Paused": "مجمد مؤقتاً",
            "Active": "نشط",
            "Pending": "معلق",
            "Closed": "مغلق",
            "High": "عالية",
            "Medium": "متوسطة",
            "Low": "منخفضة",
            "Critical": "حرجة",

            // Header & Context
            "Connected & Live": "متصل ومحدث",
            "Administrator": "مدير عام",
            "Client": "مستفيد",
            "Project Lead": "قائد مشروع",
            "Technical Staff": "منفذ فني",
            "Subscriber": "مشترك",
            "Notifications": "الإشعارات",
            "Mark all as read": "تحديد الكل كمقروء",
            "No new notifications": "لا توجد إشعارات جديدة حالياً",
            "Quick Project Switcher": "التبديل السريع للمشاريع",
            "Select a project...": "اختر مشروعاً...",
            "Active Project:": "المشروع النشط:",

            // Dashboard & Cards
            "Total Projects": "إجمالي المشاريع",
            "Approved Deliverables": "المخرجات المعتمدة",
            "Average Progress": "معدل الإنجاز العام",
            "Total Requests": "إجمالي الطلبات",
            "No active projects matching this filter.": "لا توجد مشاريع تطابق هذا الفلتر حالياً.",
            "Click here to submit your first project request.": "اضغط هنا لتقديم أول طلب مشروع.",
            "Open Workspace": "فتح مساحة عمل المشروع",
            "View Delivery Certificate": "معاينة وثيقة الاستلام الرسمية",
            "Quality Assurance & Governance": "حوكمة وضمان الجودة",
            "All deliverables and milestone sign-offs are cryptographically hashed and permanently recorded in the organizational memory engine.": "كافة المخرجات ومصادقات الاستلام موثقة ببصمات مشفرة ومحفوظة بصورة دائمة في محرك الذاكرة المؤسسية.",

            // Workspace & Deliverables
            "Workspace": "مساحة العمل",
            "Milestones & Roadmap": "المعالم وخطة الإنجاز",
            "Approved Solutions": "الحلول المعتمدة",
            "Review & Sign-off": "المعاينة والمصادقة",
            "Submit Feedback": "إرسال ملاحظة أو استفسار",
            "Request Revisions": "طلب تعديل مسبب",
            "Official Sign-off": "المصادقة والتوقيع الرسمي",
            "Sign-off Approved": "تمت المصادقة والاستلام بنجاح",
            "SHA-256 Digital Fingerprint:": "البصمة الرقمية المشفرة SHA-256:",
            "Sign-off Timestamp:": "توقيت المصادقة:",
            "Signed By:": "الموقع:",
            "No deliverables submitted yet for this project.": "لم تُرفع مخرجات معتمدة لهذا المشروع حتى الآن.",
            "All milestones have been successfully delivered and verified.": "تم إنجاز والتحقق من كافة المعالم والمخرجات بنجاح.",

            // Requests Studio & Dynamic Forms
            "Requests History": "سجل الطلبات والمقترحات",
            "Track and manage your submitted project proposals.": "متابعة مسار فرز واعتماد مقترحات وطلبات المشاريع المقدمة.",
            "Under Review": "قيد الدراسة والفرز",
            "Quotation & Scope": "إعداد نطاق العمل والميزانية",
            "Approved & Ready": "معتمد ومجدول للتنفيذ",
            "Project Title": "عنوان المشروع المطلوب",
            "Detailed Specifications": "المواصفات والمتطلبات التفصيلية",
            "Estimated Budget": "الميزانية المقترحة",
            "Target Delivery": "موعد التسليم المستهدف",
            "Attachments & Files": "المرفقات والملفات الداعمة",
            "Submit Project Request": "إرسال طلب المشروع رسمياً",
            "Request Submitted Successfully!": "تم إرسال طلب المشروع بنجاح!",
            "Our technical leads will review your request and get back to you shortly.": "سيقوم قادة المشاريع بمراجعة طلبك وإعداد نطاق العمل في أقرب وقت.",

            // Gateway & Auth
            "Welcome to Client Portal": "مرحباً بك في بوابة المستفيدين",
            "Secure enterprise gateway for project delivery, deliverables review, and organizational memory sign-offs.": "البوابة المؤسسية الآمنة لمتابعة مسار تنفيذ المشاريع ومراجعة المخرجات وتوثيق الاستلام في الذاكرة المؤسسية.",
            "Please sign in with your authorized client credentials to access your workspace.": "يرجى تسجيل الدخول بحسابك المعتمد للوصول لمساحة عملك.",
            "Username or Email": "اسم المستخدم أو البريد الإلكتروني",
            "Password": "كلمة المرور",
            "Keep me signed in": "تذكر بيانات دخولي",
            "Entering Workspace...": "جاري التحقق والدخول...",
            "Back to Main Site": "العودة للموقع العام"
        },
        fr: {
            // General & Common
            "WorkPress": "WorkPress",
            "Client Portal": "Portail Client",
            "Active Projects": "Projets Actifs",
            "Deliverables Vault": "Coffre des Livrables",
            "Project Requests": "Demandes de Projets",
            "Official Delivery Certificate": "Certificat Officiel de Livraison",
            "Submit New Request": "Nouvelle Demande",
            "Submit Request": "Envoyer la Demande",
            "New Request": "Nouvelle Demande",
            "Executive Dashboard": "Tableau de Bord Exécutif",
            "Main Overview": "Aperçu Principal",
            "Sign In": "Connexion",
            "Logout": "Déconnexion",
            "Language": "Langue",
            "Search": "Rechercher",
            "Filter": "Filtrer",
            "Loading...": "Chargement...",
            "Cancel": "Annuler",
            "Confirm": "Confirmer",
            "Save": "Enregistrer",
            "Back": "Retour",
            "Next": "Suivant",
            "Previous": "Précédent",
            "Close": "Fermer",
            "View": "Voir",
            "Download": "Télécharger",
            "Print": "Imprimer",
            "Status": "Statut",
            "Priority": "Priorité",
            "Date": "Date",
            "Due Date": "Date d'Échéance",
            "Lead": "Responsable Technique",
            "Assignees": "Assignés",
            "Total": "Total",
            "Progress": "Progression",
            "Deliverables": "Livrables",
            "Tasks": "Tâches",

            // Status Filters & Badges
            "All Projects": "Tous les Projets",
            "In Progress": "En Cours d'Exécution",
            "Under Review / Pending": "En Attente d'Examen",
            "Approved": "Récemment Approuvés",
            "Completed": "Terminés & Livrés",
            "Frozen / Paused": "En Pause",
            "Active": "Actif",
            "Pending": "En Attente",
            "Closed": "Clôturé",
            "High": "Haute",
            "Medium": "Moyenne",
            "Low": "Basse",
            "Critical": "Critique",

            // Header & Context
            "Connected & Live": "Connecté & En Direct",
            "Administrator": "Administrateur",
            "Client": "Client",
            "Project Lead": "Chef de Projet",
            "Technical Staff": "Équipe Technique",
            "Subscriber": "Abonné",
            "Notifications": "Notifications",
            "Mark all as read": "Tout marquer comme lu",
            "No new notifications": "Aucune nouvelle notification",
            "Quick Project Switcher": "Sélecteur Rapide de Projet",
            "Select a project...": "Sélectionner un projet...",
            "Active Project:": "Projet Actif:",

            // Dashboard & Cards
            "Total Projects": "Total des Projets",
            "Approved Deliverables": "Livrables Approuvés",
            "Average Progress": "Progression Moyenne",
            "Total Requests": "Total des Demandes",
            "No active projects matching this filter.": "Aucun projet ne correspond à ce filtre.",
            "Click here to submit your first project request.": "Cliquez ici pour soumettre votre premier projet.",
            "Open Workspace": "Ouvrir l'Espace de Travail",
            "View Delivery Certificate": "Voir le Certificat de Livraison",
            "Quality Assurance & Governance": "Assurance Qualité & Gouvernance",
            "All deliverables and milestone sign-offs are cryptographically hashed and permanently recorded in the organizational memory engine.": "Tous les livrables et approbations sont signés numériquement et enregistrés dans la mémoire organisationnelle.",

            // Workspace & Deliverables
            "Workspace": "Espace de Travail",
            "Milestones & Roadmap": "Jalons & Feuille de Route",
            "Approved Solutions": "Solutions Approuvées",
            "Review & Sign-off": "Examen & Approbation",
            "Submit Feedback": "Envoyer un Commentaire",
            "Request Revisions": "Demander une Révision",
            "Official Sign-off": "Signature Officielle de Réception",
            "Sign-off Approved": "Réception Confirmée avec Succès",
            "SHA-256 Digital Fingerprint:": "Empreinte Numérique SHA-256:",
            "Sign-off Timestamp:": "Horodatage de Signature:",
            "Signed By:": "Signé Par:",
            "No deliverables submitted yet for this project.": "Aucun livrable soumis pour ce projet.",
            "All milestones have been successfully delivered and verified.": "Tous les jalons ont été livrés et vérifiés avec succès.",

            // Requests Studio & Dynamic Forms
            "Requests History": "Historique des Demandes",
            "Track and manage your submitted project proposals.": "Suivez et gérez vos propositions de projets soumises.",
            "Under Review": "En Cours d'Examen",
            "Quotation & Scope": "Chiffrage & Périmètre",
            "Approved & Ready": "Approuvé & Planifié",
            "Project Title": "Titre du Projet",
            "Detailed Specifications": "Spécifications Détaillées",
            "Estimated Budget": "Budget Estimé",
            "Target Delivery": "Livraison Souhaitée",
            "Attachments & Files": "Pièces Jointes & Fichiers",
            "Submit Project Request": "Soumettre la Demande Officielle",
            "Request Submitted Successfully!": "Demande soumise avec succès !",
            "Our technical leads will review your request and get back to you shortly.": "Nos chefs de projet examineront votre demande dans les plus brefs délais.",

            // Gateway & Auth
            "Welcome to Client Portal": "Bienvenue sur le Portail Client",
            "Secure enterprise gateway for project delivery, deliverables review, and organizational memory sign-offs.": "Portail sécurisé pour le suivi de projet, l'examen des livrables et la signature de conformité.",
            "Please sign in with your authorized client credentials to access your workspace.": "Veuillez vous connecter avec vos identifiants pour accéder à votre espace.",
            "Username or Email": "Nom d'utilisateur ou E-mail",
            "Password": "Mot de passe",
            "Keep me signed in": "Rester connecté",
            "Entering Workspace...": "Connexion en cours...",
            "Back to Main Site": "Retour au Site Principal"
        }
    };

    // 2. Active State & Persistence
    let currentLang = 'ar';
    try {
        const saved = localStorage.getItem('workpress_portal_lang');
        const urlParam = new URLSearchParams(window.location.search).get('lang');
        const configLang = window.workpressPortalConfig?.activeLanguage;
        currentLang = urlParam || saved || configLang || 'ar';
    } catch (e) {
        currentLang = 'ar';
    }

    const RTL_LANGS = ['ar', 'he', 'fa', 'ur'];

    function isRTL(lang = currentLang) {
        return RTL_LANGS.includes(lang.toLowerCase().substring(0, 2));
    }

    // 3. Translation Lookup Function
    function __(text, domain = 'workpress') {
        if (!text) return '';
        
        // Check WordPress core wp.i18n first if language matches active WP locale
        if (window.wp && window.wp.i18n && typeof window.wp.i18n.__ === 'function') {
            const translated = window.wp.i18n.__(text, domain);
            if (translated && translated !== text) {
                return translated;
            }
        }

        // Fallback to built-in offline dictionaries
        const langKey = currentLang.substring(0, 2).toLowerCase();
        if (DICTIONARIES[langKey] && DICTIONARIES[langKey][text]) {
            return DICTIONARIES[langKey][text];
        }

        // Base English string
        return text;
    }

    function _x(text, context, domain = 'workpress') {
        return __(text, domain);
    }

    function _n(single, plural, number, domain = 'workpress') {
        return number === 1 ? __(single, domain) : __(plural, domain);
    }

    function sprintf(format, ...args) {
        if (!format) return '';
        let i = 0;
        return format.replace(/%[s|d|f]/g, () => (args[i] !== undefined ? args[i++] : ''));
    }

    // 4. Reactive Language Switcher Engine
    const listeners = new Set();

    function onLanguageChange(fn) {
        listeners.add(fn);
        return () => listeners.delete(fn);
    }

    function applyDOMDirectionAndFont(lang) {
        const rtl = isRTL(lang);
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr');
        
        const body = document.body;
        if (body) {
            body.setAttribute('dir', rtl ? 'rtl' : 'ltr');
            if (rtl) {
                body.classList.add('is-rtl');
                body.classList.remove('is-ltr');
            } else {
                body.classList.add('is-ltr');
                body.classList.remove('is-rtl');
            }
        }
    }

    function setLanguage(newLang) {
        if (!newLang || newLang === currentLang) return;
        currentLang = newLang;
        try {
            localStorage.setItem('workpress_portal_lang', newLang);
            document.cookie = `workpress_portal_locale=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
        } catch (e) {}

        applyDOMDirectionAndFont(newLang);

        // Notify subscribers (triggers reactive re-render)
        listeners.forEach(fn => {
            try { fn(newLang); } catch (err) { console.error('i18n listener error', err); }
        });
    }

    function getLanguage() {
        return currentLang;
    }

    function getAvailableLanguages() {
        return [
            { code: 'ar', label: 'العربية', flag: '🇸🇦', dir: 'rtl' },
            { code: 'en', label: 'English', flag: '🇺🇸', dir: 'ltr' },
            { code: 'fr', label: 'Français', flag: '🇫🇷', dir: 'ltr' }
        ];
    }

    // Initial DOM setup
    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => applyDOMDirectionAndFont(currentLang));
        } else {
            applyDOMDirectionAndFont(currentLang);
        }
    }

    // Export to global window namespace
    window.WorkPressPortalI18n = {
        __,
        _x,
        _n,
        sprintf,
        setLanguage,
        getLanguage,
        isRTL: () => isRTL(currentLang),
        getAvailableLanguages,
        onLanguageChange,
        DICTIONARIES
    };

    // Also export standard helpers
    window.__ = __;
    window._x = _x;
    window._n = _n;
    window.sprintf = sprintf;

})();
