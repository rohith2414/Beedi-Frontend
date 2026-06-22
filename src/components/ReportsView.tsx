import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { Branch } from '../types';
import { getISTDateParts, createISTDate } from '../utils/date';
import reportService from '../services/report.service';
import { useLanguage } from '../contexts/LanguageContext';

type ReportPeriod = 'daily' | 'monthly' | 'yearly';

interface BranchSummary {
    branchId: string;
    branchName: string;
    todayKattalu: number;
}

interface BranchDetailReport {
    totalKattalu: number;
    aakuSpent: number;
    thamakuSpent: number;
    dharamSpent: number;
    totalSalary?: number;
    totalDue?: number;
}

interface ReportsViewProps {
    branches: Branch[];
    onBack: () => void;
}

const ReportsView: React.FC<ReportsViewProps> = ({ branches, onBack }) => {
    const { t, language } = useLanguage();
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
    const [period, setPeriod] = useState<ReportPeriod>('daily');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [branchSummaries, setBranchSummaries] = useState<BranchSummary[]>([]);
    const [detailReport, setDetailReport] = useState<BranchDetailReport | null>(null);
    const [deductDues, setDeductDues] = useState(true);

    // Fetch branch summaries (today's kattalu for each branch)
    useEffect(() => {
        if (!selectedBranch) {
            fetchBranchSummaries();
        }
    }, [branches, selectedBranch]);

    // Fetch detailed report when branch is selected
    useEffect(() => {
        if (selectedBranch) {
            fetchDetailReport();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedBranch, period, selectedDate, deductDues]);

    const fetchBranchSummaries = async () => {
        try {
            setLoading(true);

            const data = await reportService.getTodaySummary();

            const summaries: BranchSummary[] = data.branches.map(branch => ({
                branchId: branch.branchId,
                branchName: branch.branchName,
                todayKattalu: branch.totalKattalu,
            }));

            setBranchSummaries(summaries);
        } catch (error: any) {
            console.error('Error fetching branch summaries:', error.message);
            setBranchSummaries([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchDetailReport = async () => {
        if (!selectedBranch) return;

        try {
            setLoading(true);

            // Special case: "ALL" branches - use dedicated all-branches endpoints
            if (selectedBranch.id === 'ALL') {
                const { year, month } = getISTDateParts(selectedDate);

                try {
                    let reportData;

                    if (period === 'daily') {
                        reportData = await reportService.getAllBranchesDailyReport(selectedDate, deductDues);
                    } else if (period === 'monthly') {
                        reportData = await reportService.getAllBranchesMonthlyReport(year, month, deductDues);
                    } else {
                        reportData = await reportService.getAllBranchesYearlyReport(year, deductDues);
                    }

                    setDetailReport({
                        totalKattalu: reportData.summary.totalKattalu,
                        aakuSpent: reportData.summary.totalAaku,
                        thamakuSpent: reportData.summary.totalThambaku,
                        dharamSpent: reportData.summary.totalDharam,
                        totalSalary: reportData.summary.totalSalary,
                        totalDue: reportData.summary.totalDue,
                    });
                } catch (allBranchesError: any) {
                    // Fallback: If all-branches endpoints don't exist, aggregate client-side
                    console.warn('All-branches endpoint not available, falling back to client-side aggregation:', allBranchesError.message);

                    let totalKattalu = 0;
                    let totalAaku = 0;
                    let totalThambaku = 0;
                    let totalDharam = 0;
                    let totalSalary = 0;
                    let totalDue = 0;

                    // For daily, use today's summary if available
                    if (period === 'daily') {
                        try {
                            const todayData = await reportService.getTodaySummary();
                            totalKattalu = todayData.combined.totalKattalu;
                            // Note: aaku/thambaku/dharam not available in today's summary
                        } catch (err) {
                            console.error('Error fetching today summary:', err);
                        }
                    } else {
                        // For monthly/yearly, aggregate from all branches
                        for (const branch of branches) {
                            try {
                                let branchReport;
                                if (period === 'monthly') {
                                    branchReport = await reportService.getBranchMonthlyReport(branch.id, year, month, deductDues);
                                } else {
                                    branchReport = await reportService.getBranchYearlyReport(branch.id, year, deductDues);
                                }

                                totalKattalu += branchReport.summary.totalKattalu;
                                totalAaku += branchReport.summary.totalAaku;
                                totalThambaku += branchReport.summary.totalThambaku;
                                totalDharam += branchReport.summary.totalDharam;
                                totalSalary += branchReport.summary.totalSalary || 0;
                                totalDue += branchReport.summary.totalDue || 0;
                            } catch (err) {
                                console.error(`Error fetching report for branch ${branch.name}:`, err);
                            }
                        }
                    }

                    setDetailReport({
                        totalKattalu,
                        aakuSpent: totalAaku,
                        thamakuSpent: totalThambaku,
                        dharamSpent: totalDharam,
                        totalSalary,
                        totalDue,
                    });
                }
            } else {
                // Single branch - fetch its specific data based on period
                const { year, month } = getISTDateParts(selectedDate);

                let branchReport;

                if (period === 'daily') {
                    branchReport = await reportService.getBranchDailyReport(selectedBranch.id, selectedDate, deductDues);
                } else if (period === 'monthly') {
                    branchReport = await reportService.getBranchMonthlyReport(selectedBranch.id, year, month, deductDues);
                } else {
                    branchReport = await reportService.getBranchYearlyReport(selectedBranch.id, year, deductDues);
                }

                setDetailReport({
                    totalKattalu: branchReport.summary.totalKattalu,
                    aakuSpent: branchReport.summary.totalAaku,
                    thamakuSpent: branchReport.summary.totalThambaku,
                    dharamSpent: branchReport.summary.totalDharam,
                    totalSalary: branchReport.summary.totalSalary,
                    totalDue: branchReport.summary.totalDue,
                });
            }
        } catch (error: any) {
            console.error('Error fetching detail report:', error.message);
            // Set empty report on error
            setDetailReport({
                totalKattalu: 0,
                aakuSpent: 0,
                thamakuSpent: 0,
                dharamSpent: 0,
                totalSalary: 0,
                totalDue: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    const navigateDate = (direction: number) => {
        setSelectedDate(prev => {
            const { year, month } = getISTDateParts(prev);
            if (period === 'daily') {
                const newDate = new Date(prev);
                newDate.setDate(newDate.getDate() + direction);
                return newDate;
            } else if (period === 'monthly') {
                return createISTDate(year, month - 1 + direction, 1);
            } else {
                return createISTDate(year + direction, month - 1, 1);
            }
        });
    };

    const getDateDisplay = () => {
        if (period === 'daily') {
            return selectedDate.toLocaleDateString(language === 'en' ? 'en-IN' : 'te-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                timeZone: 'Asia/Kolkata'
            });
        } else if (period === 'monthly') {
            return selectedDate.toLocaleDateString(language === 'en' ? 'en-IN' : 'te-IN', {
                month: 'long',
                year: 'numeric',
                timeZone: 'Asia/Kolkata'
            });
        } else {
            const { year } = getISTDateParts(selectedDate);
            return year.toString();
        }
    };

    const formatNumber = (num: number) => {
        return num.toLocaleString(language === 'en' ? 'en-IN' : 'te-IN');
    };

    const handleBackFromDetail = () => {
        setSelectedBranch(null);
        setPeriod('daily');
        setSelectedDate(new Date());
    };

    // Branch List View
    if (!selectedBranch) {
        return (
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <Text style={styles.backButtonText}>
                            {language === 'en' ? '← Back' : '← వెనుకకు'}
                        </Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>{language === 'en' ? '📊 Reports' : '📊 నివేదికలు'}</Text>
                    <Text style={styles.subtitle}>{language === 'en' ? 'Branches' : 'శాఖలు'}</Text>
                </View>

                {/* Today's Date */}
                <View style={styles.todayBanner}>
                    <Text style={styles.todayLabel}>{language === 'en' ? 'TODAY' : 'నేడు'}</Text>
                    <Text style={styles.todayDate}>
                        {new Date().toLocaleDateString(language === 'en' ? 'en-IN' : 'te-IN', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            timeZone: 'Asia/Kolkata'
                        })}
                    </Text>
                </View>

                {/* Branch List */}
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#10b981" />
                            <Text style={styles.loadingText}>
                                {language === 'en' ? 'Loading branches...' : 'శాఖలను లోడ్ చేస్తోంది...'}
                            </Text>
                        </View>
                    ) : branchSummaries.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>🏢</Text>
                            <Text style={styles.emptyTitle}>{language === 'en' ? 'No Branches' : 'శాఖలు లేవు'}</Text>
                            <Text style={styles.emptySubtitle}>
                                {language === 'en' ? 'Add branches to see reports' : 'నివేదికలను చూడటానికి శాఖలను జోడించండి'}
                            </Text>
                        </View>
                    ) : (
                        <>
                            {/* Total Card - Clickable */}
                            <TouchableOpacity
                                style={styles.totalCard}
                                onPress={() => {
                                    // Set a special "ALL" branch to show combined metrics
                                    setSelectedBranch({ id: 'ALL', name: language === 'en' ? 'All Branches' : 'అన్ని శాఖలు' } as Branch);
                                }}
                                activeOpacity={0.7}
                            >
                                <View style={styles.totalCardLeft}>
                                    <Text style={styles.totalCardIcon}>📊</Text>
                                    <View>
                                        <Text style={styles.totalCardTitle}>
                                            {language === 'en' ? 'All Branches' : 'అన్ని శాఖలు'}
                                        </Text>
                                        <Text style={styles.totalCardSubtext}>
                                            {language === 'en' ? 'Tap to view combined details' : 'కలిపిన వివరాలను చూడటానికి నొక్కండి'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.totalCardRight}>
                                    <Text style={styles.totalKattaluLabel}>
                                        {language === 'en' ? 'Total Kattalu' : 'మొత్తం కట్టలు'}
                                    </Text>
                                    <Text style={styles.totalKattaluValue}>
                                        {formatNumber(
                                            branchSummaries.reduce((sum, b) => sum + b.todayKattalu, 0)
                                        )}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            {/* Individual Branch Cards */}
                            {branchSummaries.map((summary) => (
                                <TouchableOpacity
                                    key={summary.branchId}
                                    style={styles.branchListCard}
                                    onPress={() => {
                                        const branch = branches.find(b => b.id === summary.branchId);
                                        if (branch) setSelectedBranch(branch);
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.branchListLeft}>
                                        <Text style={styles.branchListIcon}>🏢</Text>
                                        <View>
                                            <Text style={styles.branchListName}>{summary.branchName}</Text>
                                            <Text style={styles.branchListSubtext}>
                                                {language === 'en' ? 'Tap to view details' : 'వివరాలను చూడటానికి నొక్కండి'}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.branchListRight}>
                                        <Text style={styles.kattaluLabel}>
                                            {language === 'en' ? 'Total Kattalu' : 'మొత్తం కట్టలు'}
                                        </Text>
                                        <Text style={styles.kattaluValue}>{formatNumber(summary.todayKattalu)}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </>
                    )}
                </ScrollView>
            </View>
        );
    }

    // Detailed View (when branch is selected)
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={handleBackFromDetail}>
                    <Text style={styles.backButtonText}>{t.nav.backToBranches}</Text>
                </TouchableOpacity>
                <View style={styles.branchTitleRow}>
                    <Text style={styles.branchTitleIcon}>🏢</Text>
                    <Text style={styles.branchTitle}>{selectedBranch.name}</Text>
                </View>
            </View>

            {/* Period Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, period === 'daily' && styles.tabActive]}
                    onPress={() => setPeriod('daily')}
                >
                    <Text style={[styles.tabText, period === 'daily' && styles.tabTextActive]}>
                        {language === 'en' ? '📅 Daily' : '📅 రోజువారీ'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, period === 'monthly' && styles.tabActive]}
                    onPress={() => setPeriod('monthly')}
                >
                    <Text style={[styles.tabText, period === 'monthly' && styles.tabTextActive]}>
                        {language === 'en' ? '📆 Monthly' : '📆 నెలవారీ'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, period === 'yearly' && styles.tabActive]}
                    onPress={() => setPeriod('yearly')}
                >
                    <Text style={[styles.tabText, period === 'yearly' && styles.tabTextActive]}>
                        {language === 'en' ? '📈 Yearly' : '📈 వార్షిక'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Date Navigation */}
            <View style={styles.dateNav}>
                <TouchableOpacity style={styles.navButton} onPress={() => navigateDate(-1)}>
                    <Text style={styles.navButtonText}>‹</Text>
                </TouchableOpacity>
                <View style={styles.dateDisplay}>
                    <Text style={styles.dateText}>{getDateDisplay()}</Text>
                </View>
                <TouchableOpacity style={styles.navButton} onPress={() => navigateDate(1)}>
                    <Text style={styles.navButtonText}>›</Text>
                </TouchableOpacity>
            </View>

            {/* Dues Deduction Toggle */}
            <View style={styles.duesToggleContainer}>
                <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setDeductDues(!deductDues)}
                    activeOpacity={0.8}
                >
                    <View style={[styles.checkbox, deductDues && styles.checkboxChecked]}>
                        {deductDues && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>
                        {language === 'en' ? 'Deduct Dues from Salary' : 'జీతం నుండి బకాయిలను తీసివేయండి'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Metrics */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#10b981" />
                        <Text style={styles.loadingText}>
                            {language === 'en' ? 'Loading report...' : 'నివేదికను లోడ్ చేస్తోంది...'}
                        </Text>
                    </View>
                ) : !detailReport ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>📊</Text>
                        <Text style={styles.emptyTitle}>{language === 'en' ? 'No Data' : 'డేటా లేదు'}</Text>
                        <Text style={styles.emptySubtitle}>
                            {language === 'en' ? 'No records for this period' : 'ఈ కాలానికి రికార్డులు లేవు'}
                        </Text>
                    </View>
                ) : (
                    <View style={styles.metricsContainer}>
                        {/* Total Kattalu */}
                        <View style={[styles.metricCard, styles.kattaluCard]}>
                            <Text style={styles.metricIcon}>📦</Text>
                            <Text style={styles.metricLabel}>
                                {language === 'en' ? 'Total Kattalu' : 'మొత్తం కట్టలు'}
                            </Text>
                            <Text style={styles.metricValue}>
                                {formatNumber(detailReport.totalKattalu)}
                            </Text>
                        </View>

                        {/* Amount to Pay */}
                        <View style={[styles.metricCard, styles.salaryCard]}>
                            <Text style={styles.metricIcon}>💰</Text>
                            <Text style={styles.metricLabel}>
                                {language === 'en' ? 'Amount to Pay' : 'చెల్లించాల్సిన మొత్తం'}
                            </Text>
                            <Text style={styles.metricValue}>
                                ₹{formatNumber(detailReport.totalSalary || 0)}
                            </Text>
                        </View>

                        {/* Aaku Spent */}
                        <View style={[styles.metricCard, styles.aakuCard]}>
                            <Text style={styles.metricIcon}>🌾</Text>
                            <Text style={styles.metricLabel}>
                                {language === 'en' ? 'Aaku Spent' : 'ఆకు ఖర్చు'}
                            </Text>
                            <Text style={styles.metricValue}>
                                {formatNumber(detailReport.aakuSpent)}
                            </Text>
                        </View>

                        {/* Thambaku Spent */}
                        <View style={[styles.metricCard, styles.thamakuCard]}>
                            <Text style={styles.metricIcon}>🍃</Text>
                            <Text style={styles.metricLabel}>
                                {language === 'en' ? 'Thambaku Spent' : 'తంబాకు ఖర్చు'}
                            </Text>
                            <Text style={styles.metricValue}>
                                {formatNumber(detailReport.thamakuSpent)}
                            </Text>
                        </View>

                        {/* Dharam Spent */}
                        <View style={[styles.metricCard, styles.dharamCard]}>
                            <Text style={styles.metricIcon}>✨</Text>
                            <Text style={styles.metricLabel}>
                                {language === 'en' ? 'Dharam Spent' : 'ధరం ఖర్చు'}
                            </Text>
                            <Text style={styles.metricValue}>
                                {formatNumber(detailReport.dharamSpent)}
                            </Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    header: {
        backgroundColor: '#fff',
        paddingTop: 48,
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    backButton: {
        paddingVertical: 8,
        marginBottom: 8,
    },
    backButtonText: {
        color: '#3b82f6',
        fontSize: 18,
        fontWeight: '600',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        marginTop: 4,
    },
    branchTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    branchTitleIcon: {
        fontSize: 28,
    },
    branchTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    todayBanner: {
        backgroundColor: '#667eea',
        paddingVertical: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    todayLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: 'rgba(255, 255, 255, 0.8)',
        letterSpacing: 2,
        marginBottom: 4,
    },
    todayDate: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        padding: 60,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6b7280',
        fontWeight: '500',
    },
    emptyContainer: {
        padding: 60,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
    },
    // Total Card (Clickable)
    totalCard: {
        backgroundColor: '#10b981',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        borderLeftWidth: 6,
        borderLeftColor: '#059669',
    },
    totalCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1,
    },
    totalCardIcon: {
        fontSize: 40,
    },
    totalCardTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    totalCardSubtext: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: 4,
    },
    totalCardRight: {
        alignItems: 'flex-end',
    },
    totalKattaluLabel: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '600',
        marginBottom: 4,
    },
    totalKattaluValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    // Branch List Styles
    branchListCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        borderLeftWidth: 6,
        borderLeftColor: '#10b981',
    },
    branchListLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1,
    },
    branchListIcon: {
        fontSize: 36,
    },
    branchListName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    branchListSubtext: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
    },
    branchListRight: {
        alignItems: 'flex-end',
    },
    kattaluLabel: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '600',
        marginBottom: 4,
    },
    kattaluValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#10b981',
    },
    // Tabs
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    tabActive: {
        backgroundColor: '#d1fae5',
        borderColor: '#10b981',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#6b7280',
    },
    tabTextActive: {
        color: '#10b981',
    },
    // Date Navigation
    dateNav: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#667eea',
        paddingVertical: 20,
        paddingHorizontal: 16,
        elevation: 4,
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    navButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        width: 50,
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    navButtonText: {
        fontSize: 28,
        color: '#fff',
        fontWeight: 'bold',
    },
    dateDisplay: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    dateText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
    },
    // Metrics
    metricsContainer: {
        gap: 16,
    },
    metricCard: {
        padding: 24,
        borderRadius: 16,
        borderLeftWidth: 6,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    kattaluCard: {
        backgroundColor: '#d1fae5',
        borderLeftColor: '#10b981',
    },
    aakuCard: {
        backgroundColor: '#fef3c7',
        borderLeftColor: '#f59e0b',
    },
    thamakuCard: {
        backgroundColor: '#dbeafe',
        borderLeftColor: '#3b82f6',
    },
    dharamCard: {
        backgroundColor: '#fce7f3',
        borderLeftColor: '#ec4899',
    },
    salaryCard: {
        backgroundColor: '#e0e7ff',
        borderLeftColor: '#6366f1',
    },
    metricIcon: {
        fontSize: 32,
        marginBottom: 12,
    },
    metricLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: 8,
    },
    metricValue: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    duesToggleContainer: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 22,
        height: 22,
        borderWidth: 2,
        borderColor: '#10b981',
        borderRadius: 6,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#10b981',
    },
    checkmark: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    checkboxLabel: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ReportsView;
