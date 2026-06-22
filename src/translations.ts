export type Language = 'en' | 'te';

export interface Translations {
    // Dashboard
    dashboard: {
        title: string;
        subtitle: string;
        branches: string;
        workers: string;
        reports: string;
        total: string;
        reportsAnalytics: string;
        reportsDescription: string;
    };

    // Navigation
    nav: {
        backToDashboard: string;
        backToBranches: string;
        backToWorkers: string;
    };

    // Branches
    branches: {
        selectBranch: string;
        create: string;
        updateRate: string;
        permanentRate: string;
        contractRate: string;
        workersCount: string;
        noBranchesFound: string;
    };

    // Workers
    workers: {
        allWorkers: string;
        add: string;
        searchPlaceholder: string;
        noWorkersFound: string;
        permanent: string;
        contract: string;
        serialNo: string;
    };

    // Worker Card
    workerCard: {
        today: string;
        monthlyData: string;
        day: string;
        aaku: string;
        thambaku: string;
        dharam: string;
        kattalu: string;
        baakiKattalu: string;
        monthlySummary: string;
        totalKattalu: string;
        totalDue: string;
        deductDues: string;
        effectiveKattalu: string;
        ratePer1000: string;
        totalSalary: string;
        saveMonthlyData: string;
        call: string;
    };

    // Modals
    modals: {
        updateRate: string;
        createBranch: string;
        createWorker: string;
        editWorker: string;
        branchName: string;
        workerName: string;
        phone: string;
        workerType: string;
        cancel: string;
        update: string;
        create: string;
        save: string;
    };

    // Common
    common: {
        loading: string;
        error: string;
        success: string;
    };

    // Months
    months: {
        january: string;
        february: string;
        march: string;
        april: string;
        may: string;
        june: string;
        july: string;
        august: string;
        september: string;
        october: string;
        november: string;
        december: string;
    };

    // Days of week
    days: {
        sunday: string;
        monday: string;
        tuesday: string;
        wednesday: string;
        thursday: string;
        friday: string;
        saturday: string;
    };
    // Subscription & Payment
    subscription: {
        title: string;
        status: string;
        trialActive: string;
        trialExpired: string;
        subscribedActive: string;
        subscribedExpired: string;
        daysRemaining: string;
        trialDaysRemaining: string;
        expiryDate: string;
        subscribeNow: string;
        paymentHistory: string;
        amountLabel: string;
        amountValue: string;
        orderId: string;
        paymentId: string;
        date: string;
        paymentStatus: string;
        logout: string;
        planDetails: string;
        billingTimeline: string;
        freeTrialInfo: string;
        lockedMessage: string;
        simulatedPaymentMode: string;
        verifySuccess: string;
        cancelMessage: string;
        failMessage: string;
        historyEmpty: string;
        daysLeftLabel: string;
    };
}

export const translations: Record<Language, Translations> = {
    en: {
        dashboard: {
            title: 'Beedi Management',
            subtitle: 'System Dashboard',
            branches: 'Branches',
            workers: 'Workers',
            reports: 'Reports',
            total: 'Total',
            reportsAnalytics: 'Reports & Analytics',
            reportsDescription: 'View monthly reports and performance insights',
        },
        nav: {
            backToDashboard: '← Back to Dashboard',
            backToBranches: '← Back to Branches',
            backToWorkers: '← Back to Workers',
        },
        branches: {
            selectBranch: 'Select Branch',
            create: '+ Create',
            updateRate: '⚙ Update Rate',
            permanentRate: 'Permanent Rate',
            contractRate: 'Contract Rate',
            workersCount: 'workers',
            noBranchesFound: 'No branches found',
        },
        workers: {
            allWorkers: 'All Workers',
            add: '+ Add',
            searchPlaceholder: 'Search by name or serial number...',
            noWorkersFound: 'No workers found',
            permanent: 'Permanent',
            contract: 'Contract',
            serialNo: 'Serial No',
        },
        workerCard: {
            today: 'Today:',
            monthlyData: 'Monthly Data',
            day: 'Day',
            aaku: 'Aaku',
            thambaku: 'Thambaku',
            dharam: 'Dharam',
            kattalu: 'Kattalu',
            baakiKattalu: 'Baaki Kattalu',
            monthlySummary: 'Monthly Summary',
            totalKattalu: 'Total Kattalu:',
            totalDue: 'Total Due:',
            deductDues: 'Deduct dues from salary',
            effectiveKattalu: 'Effective Kattalu:',
            ratePer1000: 'Rate per 1000:',
            totalSalary: 'Total Salary:',
            saveMonthlyData: 'Save Monthly Data',
            call: 'Call',
        },
        modals: {
            updateRate: 'Update Rate',
            createBranch: 'Create Branch',
            createWorker: 'Create Worker',
            editWorker: 'Edit Worker',
            branchName: 'Branch Name',
            workerName: 'Worker Name',
            phone: 'Phone',
            workerType: 'Worker Type',
            cancel: 'Cancel',
            update: 'Update',
            create: 'Create',
            save: 'Save',
        },
        common: {
            loading: 'Loading...',
            error: 'Error',
            success: 'Success',
        },
        months: {
            january: 'January',
            february: 'February',
            march: 'March',
            april: 'April',
            may: 'May',
            june: 'June',
            july: 'July',
            august: 'August',
            september: 'September',
            october: 'October',
            november: 'November',
            december: 'December',
        },
        days: {
            sunday: 'Sunday',
            monday: 'Monday',
            tuesday: 'Tuesday',
            wednesday: 'Wednesday',
            thursday: 'Thursday',
            friday: 'Friday',
            saturday: 'Saturday',
        },
        subscription: {
            title: 'Subscription & Payment',
            status: 'Status',
            trialActive: 'Free Trial (Active)',
            trialExpired: 'Free Trial Expired',
            subscribedActive: 'Premium Plan (Active)',
            subscribedExpired: 'Premium Plan Expired',
            daysRemaining: 'Days Remaining',
            trialDaysRemaining: 'Trial Days Remaining',
            expiryDate: 'Expiry Date',
            subscribeNow: 'Subscribe Now',
            paymentHistory: 'Payment History',
            amountLabel: 'Plan Price',
            amountValue: '₹999 / month',
            orderId: 'Order ID',
            paymentId: 'Payment ID',
            date: 'Date',
            paymentStatus: 'Payment Status',
            logout: 'Logout',
            planDetails: 'Plan Details',
            billingTimeline: 'Billing Timeline',
            freeTrialInfo: 'Your 30-day free trial gives you full access to all features.',
            lockedMessage: 'Your access is locked. Please subscribe to continue using the application.',
            simulatedPaymentMode: 'Simulated Payment Mode (Test)',
            verifySuccess: 'Payment verified successfully! Subscription activated.',
            cancelMessage: 'Payment was cancelled.',
            failMessage: 'Payment failed. Please try again.',
            historyEmpty: 'No payment records found',
            daysLeftLabel: 'days left',
        },
    },
    te: {
        dashboard: {
            title: 'బీడీ నిర్వహణ',
            subtitle: 'సిస్టమ్ డాష్‌బోర్డ్',
            branches: 'శాఖలు',
            workers: 'కార్మికులు',
            reports: 'నివేదికలు',
            total: 'మొత్తం',
            reportsAnalytics: 'నివేదికలు & విశ్లేషణ',
            reportsDescription: 'నెలవారీ నివేదికలు మరియు పనితీరు అంతర్దృష్టులను చూడండి',
        },
        nav: {
            backToDashboard: '← డాష్‌బోర్డ్‌కు తిరిగి',
            backToBranches: '← శాఖలకు తిరిగి',
            backToWorkers: '← కార్మికులకు తిరిగి',
        },
        branches: {
            selectBranch: 'శాఖను ఎంచుకోండి',
            create: '+ సృష్టించు',
            updateRate: '⚙ రేటు నవీకరించు',
            permanentRate: 'శాశ్వత రేటు',
            contractRate: 'కాంట్రాక్ట్ రేటు',
            workersCount: 'కార్మికులు',
            noBranchesFound: 'శాఖలు కనుగొనబడలేదు',
        },
        workers: {
            allWorkers: 'అన్ని కార్మికులు',
            add: '+ జోడించు',
            searchPlaceholder: 'పేరు లేదా సీరియల్ నంబర్ ద్వారా శోధించండి...',
            noWorkersFound: 'కార్మికులు కనుగొనబడలేదు',
            permanent: 'శాశ్వత',
            contract: 'కాంట్రాక్ట్',
            serialNo: 'సీరియల్ నం',
        },
        workerCard: {
            today: 'నేడు:',
            monthlyData: 'నెలవారీ డేటా',
            day: 'రోజు',
            aaku: 'ఆకు',
            thambaku: 'తంబాకు',
            dharam: 'ధరం',
            kattalu: 'కట్టలు',
            baakiKattalu: 'బాకీ కట్టలు',
            monthlySummary: 'నెలవారీ సారాంశం',
            totalKattalu: 'మొత్తం కట్టలు:',
            totalDue: 'మొత్తం బాకీ:',
            deductDues: 'జీతం నుండి బాకీలను తీసివేయండి',
            effectiveKattalu: 'ప్రభావవంతమైన కట్టలు:',
            ratePer1000: '1000కి రేటు:',
            totalSalary: 'మొత్తం జీతం:',
            saveMonthlyData: 'నెలవారీ డేటాను సేవ్ చేయండి',
            call: 'కాల్ చేయండి',
        },
        modals: {
            updateRate: 'రేటు నవీకరించు',
            createBranch: 'శాఖ సృష్టించు',
            createWorker: 'కార్మికుడిని సృష్టించు',
            editWorker: 'కార్మికుడిని సవరించు',
            branchName: 'శాఖ పేరు',
            workerName: 'కార్మికుడి పేరు',
            phone: 'ఫోన్',
            workerType: 'కార్మికుడి రకం',
            cancel: 'రద్దు చేయి',
            update: 'నవీకరించు',
            create: 'సృష్టించు',
            save: 'సేవ్ చేయి',
        },
        common: {
            loading: 'లోడ్ అవుతోంది...',
            error: 'లోపం',
            success: 'విజయం',
        },
        months: {
            january: 'జనవరి',
            february: 'ఫిబ్రవరి',
            march: 'మార్చి',
            april: 'ఏప్రిల్',
            may: 'మే',
            june: 'జూన్',
            july: 'జూలై',
            august: 'ఆగస్టు',
            september: 'సెప్టెంబర్',
            october: 'అక్టోబర్',
            november: 'నవంబర్',
            december: 'డిసెంబర్',
        },
        days: {
            sunday: 'ఆదివారం',
            monday: 'సోమవారం',
            tuesday: 'మంగళవారం',
            wednesday: 'బుధవారం',
            thursday: 'గురువారం',
            friday: 'శుక్రవారం',
            saturday: 'శనివారం',
        },
        subscription: {
            title: 'సందా & చెల్లింపు (Subscription)',
            status: 'స్థితి',
            trialActive: 'ఉచిత ట్రయల్ (క్రియాశీలకంగా ఉంది)',
            trialExpired: 'ఉచిత ట్రయల్ ముగిసింది',
            subscribedActive: 'ప్రీమియం ప్లాన్ (క్రియాశీలకంగా ఉంది)',
            subscribedExpired: 'ప్రీమియం ప్లాన్ ముగిసింది',
            daysRemaining: 'మిగిలి ఉన్న రోజులు',
            trialDaysRemaining: 'ట్రయల్ మిగిలి ఉన్న రోజులు',
            expiryDate: 'గడువు తేదీ',
            subscribeNow: 'సబ్స్క్రయిబ్ చేసుకోండి',
            paymentHistory: 'చెల్లింపుల చరిత్ర',
            amountLabel: 'ప్లాన్ ధర',
            amountValue: 'నెలకు ₹999',
            orderId: 'ఆర్డర్ ఐడి',
            paymentId: 'చెల్లింపు ఐడి',
            date: 'తేదీ',
            paymentStatus: 'చెల్లింపు స్థితి',
            logout: 'లాగ్ అవుట్',
            planDetails: 'ప్లాన్ వివరాలు',
            billingTimeline: 'బిల్లింగ్ కాలక్రమం',
            freeTrialInfo: 'మీ 30 రోజుల ఉచిత ట్రయల్ అన్ని ఫీచర్లకు పూర్తి యాక్సెస్‌ను ఇస్తుంది.',
            lockedMessage: 'మీ యాక్సెస్ లాక్ చేయబడింది. అప్లికేషన్‌ను ఉపయోగించడం కొనసాగించడానికి దయచేసి సబ్‌స్క్రైబ్ చేయండి.',
            simulatedPaymentMode: 'సిమ్యులేటెడ్ చెల్లింపు మోడ్ (పరీక్ష)',
            verifySuccess: 'చెల్లింపు విజయవంతంగా ధృవీకరించబడింది! సబ్స్క్రిప్షన్ యాక్టివేట్ చేయబడింది.',
            cancelMessage: 'చెల్లింపు రద్దు చేయబడింది.',
            failMessage: 'చెల్లింపు విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.',
            historyEmpty: 'చెల్లింపు రికార్డులు ఏవీ కనుగొనబడలేదు',
            daysLeftLabel: 'రోజులు మిగిలి ఉన్నాయి',
        },
    },
};
