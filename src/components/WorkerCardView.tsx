import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    FlatList,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Linking,
    Modal,
    Animated,
    ActivityIndicator,
} from 'react-native';
import { Worker, DailyData, Branch } from '../types';
import recordService from '../services/record.service';
import { formatDateForAPI, getISTDateParts, getDaysInMonth as getDaysInMonthHelper, createISTDate } from '../utils/date';

type TimeRange = 'day' | 'week' | 'month';

interface WorkerCardViewProps {
    worker: Worker;
    branch: Branch;
    onBack: () => void;
}

const WorkerCardView: React.FC<WorkerCardViewProps> = ({
    worker,
    branch,
    onBack,
}) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [deductDues, setDeductDues] = useState(true);
    const [timeRange, setTimeRange] = useState<TimeRange>('month');
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Track the last successfully saved value for each day + field to prevent duplicate calls
    const lastSavedValues = useRef<{ [key: string]: string }>({});

    // Track the currently focused / edited input to save it when user leaves the screen
    const activeInputRef = useRef<{ day: number; date: string | Date; field: keyof DailyData; value: string } | null>(null);

    const getDaysInMonth = (date: Date) => {
        const { year, month } = getISTDateParts(date);
        return getDaysInMonthHelper(year, month);
    };

    const getMonthYear = (date: Date) => {
        return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });
    };

    const navigateMonth = (direction: number) => {
        setSelectedMonth(prev => {
            const { year, month } = getISTDateParts(prev);
            const newDate = createISTDate(year, month - 1 + direction, 1);
            return newDate;
        });
    };

    const navigateDate = (direction: number) => {
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            if (timeRange === 'day') {
                newDate.setDate(newDate.getDate() + direction);
            } else if (timeRange === 'week') {
                newDate.setDate(newDate.getDate() + (direction * 7));
            } else {
                const { year, month, day } = getISTDateParts(prev);
                return createISTDate(year, month - 1 + direction, day);
            }
            return newDate;
        });
    };

    const getFilteredDays = () => {
        const today = new Date(selectedDate);
        const days: number[] = [];

        if (timeRange === 'day') {
            const { day } = getISTDateParts(today);
            days.push(day);
        } else if (timeRange === 'week') {
            // Get last 7 days from selected date
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateParts = getISTDateParts(date);
                const selectedMonthParts = getISTDateParts(selectedMonth);
                if (dateParts.month === selectedMonthParts.month &&
                    dateParts.year === selectedMonthParts.year) {
                    days.push(dateParts.day);
                }
            }
        } else {
            // Show all days in month
            const daysInMonth = getDaysInMonth(selectedMonth);
            for (let i = 1; i <= daysInMonth; i++) {
                days.push(i);
            }
        }

        return days;
    };

    const getDateRangeText = () => {
        if (timeRange === 'day') {
            return selectedDate.toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                timeZone: 'Asia/Kolkata'
            });
        } else if (timeRange === 'week') {
            const endDate = new Date(selectedDate);
            const startDate = new Date(selectedDate);
            startDate.setDate(startDate.getDate() - 6);
            return `${startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' })} - ${endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })}`;
        } else {
            return getMonthYear(selectedMonth);
        }
    };

    const daysInMonth = getDaysInMonth(selectedMonth);

    // Initialize daily data with empty values for all days
    const [dailyData, setDailyData] = useState<DailyData[]>(() => {
        const { year, month } = getISTDateParts(selectedMonth);
        return Array.from({ length: daysInMonth }, (_, i) => {
            const date = createISTDate(year, month - 1, i + 1);
            return {
                day: i + 1,
                date: formatDateForAPI(date), // Use local timezone
                aaku: '',
                thambaku: '',
                dharam: '',
                kattalu: '',
                baakiKattalu: ''
            };
        });
    });

    // Fetch monthly records from API
    useEffect(() => {
        const fetchMonthlyRecords = async () => {
            try {
                setLoading(true);
                const { year, month } = getISTDateParts(selectedMonth);

                console.log('📅 Fetching records for:', worker.name, year, month);
                const records = await recordService.getMonthlyRecords(worker.id, year, month);
                console.log('✅ Fetched', records.length, 'records');

                // Create a map of day -> record for quick lookup
                const recordMap = new Map<number, DailyData>();
                records.forEach(record => {
                    if (record.day) {
                        recordMap.set(record.day, record);
                    }
                });

                // Initialize data for all days in month
                const days = getDaysInMonth(selectedMonth);
                const newData = Array.from({ length: days }, (_, i) => {
                    const dayNum = i + 1;
                    const date = createISTDate(year, month - 1, dayNum);
                    const existingRecord = recordMap.get(dayNum);

                    if (existingRecord) {
                        // Use existing record from API
                        return existingRecord;
                    } else {
                        // Create empty record for this day (using local timezone)
                        return {
                            day: dayNum,
                            date: formatDateForAPI(date), // Use local timezone, not UTC
                            aaku: '',
                            thambaku: '',
                            dharam: '',
                            kattalu: '',
                            baakiKattalu: ''
                        };
                    }
                });

                // Populate lastSavedValues ref to avoid duplicate saving calls
                const initialSaved: { [key: string]: string } = {};
                newData.forEach(dayItem => {
                    initialSaved[`${dayItem.day}_aaku`] = (dayItem.aaku ?? '').toString();
                    initialSaved[`${dayItem.day}_thambaku`] = (dayItem.thambaku ?? '').toString();
                    initialSaved[`${dayItem.day}_dharam`] = (dayItem.dharam ?? '').toString();
                    initialSaved[`${dayItem.day}_kattalu`] = (dayItem.kattalu ?? '').toString();
                    initialSaved[`${dayItem.day}_baakiKattalu`] = (dayItem.baakiKattalu ?? '').toString();
                });
                lastSavedValues.current = initialSaved;

                setDailyData(newData);
            } catch (error: any) {
                console.error('❌ Error fetching records:', error.message);
                // Initialize with empty data on error (using local timezone)
                const days = getDaysInMonth(selectedMonth);
                const { year, month } = getISTDateParts(selectedMonth);
                const emptyData = Array.from({ length: days }, (_, i) => {
                    const date = createISTDate(year, month - 1, i + 1);
                    return {
                        day: i + 1,
                        date: formatDateForAPI(date), // Use local timezone
                        aaku: '',
                        thambaku: '',
                        dharam: '',
                        kattalu: '',
                        baakiKattalu: ''
                    };
                });

                // Initialize lastSavedValues to empty strings on error
                const initialSaved: { [key: string]: string } = {};
                emptyData.forEach(dayItem => {
                    initialSaved[`${dayItem.day}_aaku`] = '';
                    initialSaved[`${dayItem.day}_thambaku`] = '';
                    initialSaved[`${dayItem.day}_dharam`] = '';
                    initialSaved[`${dayItem.day}_kattalu`] = '';
                    initialSaved[`${dayItem.day}_baakiKattalu`] = '';
                });
                lastSavedValues.current = initialSaved;

                setDailyData(emptyData);
            } finally {
                setLoading(false);
            }
        };

        fetchMonthlyRecords();
    }, [selectedMonth, worker.id]);


    const handleInputChange = (day: number, field: keyof DailyData, value: string) => {
        setDailyData(prev => prev.map(item =>
            item.day === day ? { ...item, [field]: value } : item
        ));
    };

    // Save unsaved active input when leaving/unmounting
    useEffect(() => {
        return () => {
            if (activeInputRef.current) {
                const { date, day, field, value } = activeInputRef.current;
                console.log(`🧹 Component unmounting. Saving active input for day ${day}, field ${field}: ${value}`);
                saveFieldDirectly(worker.id, date, day, field, value);
            }
        };
    }, [worker.id]);

    // Save a single field to API (partial update)
    const saveField = async (day: number, field: keyof DailyData, value: string) => {
        const dayData = dailyData.find(d => d.day === day);
        if (!dayData) return;

        await saveFieldDirectly(worker.id, dayData.date, day, field, value);
    };

    const saveFieldDirectly = async (
        workerId: string,
        date: string | Date,
        day: number,
        field: keyof DailyData,
        value: string
    ) => {
        const key = `${day}_${field}`;
        if (lastSavedValues.current[key] === value) {
            console.log(`⚡ Skip saving ${field} for day ${day} - value unchanged`);
            return;
        }
        lastSavedValues.current[key] = value;

        try {
            const updateData: any = {
                workerId,
                date,
            };

            if (field === 'aaku' || field === 'thambaku' || field === 'dharam' ||
                field === 'kattalu' || field === 'baakiKattalu') {
                const numValue = parseInt(value) || 0;
                updateData[field] = numValue;
            }

            console.log(`💾 Saving ${field} for day ${day}. Payload:`, JSON.stringify(updateData));
            await recordService.saveRecord(updateData);
            console.log(`✅ Saved ${field} for day ${day}`);
        } catch (error: any) {
            console.error(`❌ Error saving ${field}:`, error.message);
        }
    };

    const totalKattalu = dailyData.reduce((sum, day) =>
        sum + (parseInt(day.kattalu.toString()) || 0), 0
    );
    const totalDue = dailyData.reduce((sum, day) =>
        sum + (parseInt(day?.baakiKattalu.toString()) || 0), 0
    );
    const effectiveKattalu = deductDues ? totalKattalu - totalDue : totalKattalu;
    // Calculate salary based on worker type
    const branchRate = worker.employeeType === 'PERMANENT' ? branch.permanentRate : branch.contractRate;
    const totalSalary = (effectiveKattalu / 1000) * branchRate;

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollContent}
                contentContainerStyle={styles.scrollContentContainer}
                showsVerticalScrollIndicator={true}
                stickyHeaderIndices={[1]}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={onBack}
                    >
                        <Text style={styles.backButtonText}>← Back to Workers</Text>
                    </TouchableOpacity>

                    <View style={styles.workerInfo}>
                        <View style={styles.workerNameRow}>
                            <Text style={styles.workerCardTitle}>{worker.name}</Text>
                            <View style={[styles.typeBadge, worker.employeeType === 'PERMANENT' ? styles.typeBadgePermanent : styles.typeBadgeContract]}>
                                <Text style={styles.typeBadgeText}>{worker.employeeType === 'PERMANENT' ? 'Permanent' : 'Contract'}</Text>
                            </View>
                        </View>
                        <Text style={styles.workerCardSerial}>{worker.serialNo}</Text>
                        <Text style={styles.branchName}>📍 {branch.name}</Text>
                        <View style={styles.phoneRow}>
                            <Text style={styles.phoneText}>{worker.phone}</Text>
                            <TouchableOpacity
                                style={styles.callButton}
                                onPress={() => {
                                    Linking.openURL(`tel:${worker.phone}`);
                                }}
                            >
                                <Text style={styles.callButtonText}>📞 Call</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Time Range Filter Dropdown */}
                    <View style={styles.filterContainer}>
                        <Text style={styles.filterLabel}>View Data:</Text>
                        <TouchableOpacity
                            style={styles.dropdownButton}
                            onPress={() => setDropdownVisible(!dropdownVisible)}
                        >
                            <View style={styles.dropdownButtonContent}>
                                <Text style={styles.dropdownButtonText}>
                                    {timeRange === 'day' ? '📅 Day' : timeRange === 'week' ? '📊 Week' : '📆 Month'}
                                </Text>
                                <Text style={[styles.dropdownArrow, dropdownVisible && styles.dropdownArrowUp]}>▼</Text>
                            </View>
                        </TouchableOpacity>

                        {dropdownVisible && (
                            <View style={styles.dropdownMenu}>
                                <TouchableOpacity
                                    style={[styles.dropdownItem, timeRange === 'day' && styles.dropdownItemActive]}
                                    onPress={() => {
                                        setTimeRange('day');
                                        setDropdownVisible(false);
                                    }}
                                >
                                    <Text style={[styles.dropdownItemText, timeRange === 'day' && styles.dropdownItemTextActive]}>
                                        📅 Single Day
                                    </Text>
                                    {timeRange === 'day' && <Text style={styles.checkIcon}>✓</Text>}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.dropdownItem, timeRange === 'week' && styles.dropdownItemActive]}
                                    onPress={() => {
                                        setTimeRange('week');
                                        setDropdownVisible(false);
                                    }}
                                >
                                    <Text style={[styles.dropdownItemText, timeRange === 'week' && styles.dropdownItemTextActive]}>
                                        📊 Last 7 Days
                                    </Text>
                                    {timeRange === 'week' && <Text style={styles.checkIcon}>✓</Text>}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.dropdownItem, timeRange === 'month' && styles.dropdownItemActive]}
                                    onPress={() => {
                                        setTimeRange('month');
                                        setDropdownVisible(false);
                                    }}
                                >
                                    <Text style={[styles.dropdownItemText, timeRange === 'month' && styles.dropdownItemTextActive]}>
                                        📆 Full Month
                                    </Text>
                                    {timeRange === 'month' && <Text style={styles.checkIcon}>✓</Text>}
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Date Navigation */}
                    <View style={styles.dateNav}>
                        <TouchableOpacity
                            onPress={() => timeRange === 'month' ? navigateMonth(-1) : navigateDate(-1)}
                            style={styles.dateButton}
                        >
                            <Text style={styles.dateButtonText}>‹</Text>
                        </TouchableOpacity>
                        <View style={styles.dateTextContainer}>
                            <Text style={styles.dateRangeText}>{getDateRangeText()}</Text>
                            <Text style={styles.dateRangeSubtext}>
                                {timeRange === 'day' ? 'Single day view' : timeRange === 'week' ? '7 days view' : 'Monthly view'}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => timeRange === 'month' ? navigateMonth(1) : navigateDate(1)}
                            style={styles.dateButton}
                        >
                            <Text style={styles.dateButtonText}>›</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Current Date Indicator */}
                    <View style={styles.currentDateContainer}>
                        <View style={styles.todayBadge}>
                            <Text style={styles.todayBadgeText}>TODAY</Text>
                        </View>
                        <Text style={styles.currentDateText}>
                            {new Date().toLocaleDateString('en-IN', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                timeZone: 'Asia/Kolkata'
                            })}
                        </Text>
                    </View>
                </View>

                {/* Sticky Table Header */}
                <View style={styles.tableHeaderContainer}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableCell, styles.dayCell, styles.headerCell]}>Day</Text>
                        <Text style={[styles.tableCell, styles.headerCell]}>Aaku</Text>
                        <Text style={[styles.tableCell, styles.headerCell]}>Thambaku</Text>
                        <Text style={[styles.tableCell, styles.headerCell]}>Dharam</Text>
                        <Text style={[styles.tableCell, styles.kattaluHeader]}>Kattalu</Text>
                        <Text style={[styles.tableCell, styles.dueHeader]}>Baaki Kattalu</Text>
                    </View>
                </View>

                {/* Table Rows */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#10b981" />
                        <Text style={styles.loadingText}>Loading records...</Text>
                    </View>
                ) : (
                    dailyData
                        .filter(day => getFilteredDays().includes(day.day!))
                        .map((day) => (
                            <View key={day.day!} style={styles.tableRow}>
                                <Text style={[styles.tableCell, styles.dayCell, styles.dayNumber]}>{day.day}</Text>
                                <TextInput
                                    style={[styles.tableCell, styles.input]}
                                    value={day.aaku.toString()}
                                    onChangeText={(val) => {
                                        handleInputChange(day.day!, 'aaku', val);
                                        activeInputRef.current = { day: day.day!, date: day.date, field: 'aaku', value: val };
                                    }}
                                    onBlur={() => {
                                        saveField(day.day!, 'aaku', day.aaku.toString());
                                        activeInputRef.current = null;
                                    }}
                                    keyboardType="numeric"
                                    placeholder="0"
                                />
                                <TextInput
                                    style={[styles.tableCell, styles.input]}
                                    value={day.thambaku.toString()}
                                    onChangeText={(val) => {
                                        handleInputChange(day.day!, 'thambaku', val);
                                        activeInputRef.current = { day: day.day!, date: day.date, field: 'thambaku', value: val };
                                    }}
                                    onBlur={() => {
                                        saveField(day.day!, 'thambaku', day.thambaku.toString());
                                        activeInputRef.current = null;
                                    }}
                                    keyboardType="numeric"
                                    placeholder="0"
                                />
                                <TextInput
                                    style={[styles.tableCell, styles.input]}
                                    value={day.dharam.toString()}
                                    onChangeText={(val) => {
                                        handleInputChange(day.day!, 'dharam', val);
                                        activeInputRef.current = { day: day.day!, date: day.date, field: 'dharam', value: val };
                                    }}
                                    onBlur={() => {
                                        saveField(day.day!, 'dharam', day.dharam.toString());
                                        activeInputRef.current = null;
                                    }}
                                    keyboardType="numeric"
                                    placeholder="0"
                                />
                                <TextInput
                                    style={[styles.tableCell, styles.input, styles.kattaluInput]}
                                    value={day.kattalu.toString()}
                                    onChangeText={(val) => {
                                        handleInputChange(day.day!, 'kattalu', val);
                                        activeInputRef.current = { day: day.day!, date: day.date, field: 'kattalu', value: val };
                                    }}
                                    onBlur={() => {
                                        saveField(day.day!, 'kattalu', day.kattalu.toString());
                                        activeInputRef.current = null;
                                    }}
                                    keyboardType="numeric"
                                    placeholder="0"
                                />
                                <TextInput
                                    style={[styles.tableCell, styles.input, styles.dueInput]}
                                    value={day.baakiKattalu.toString()}
                                    onChangeText={(val) => {
                                        handleInputChange(day.day!, 'baakiKattalu', val);
                                        activeInputRef.current = { day: day.day!, date: day.date, field: 'baakiKattalu', value: val };
                                    }}
                                    onBlur={() => {
                                        saveField(day.day!, 'baakiKattalu', day.baakiKattalu.toString());
                                        activeInputRef.current = null;
                                    }}
                                    keyboardType="numeric"
                                    placeholder="0"
                                />
                            </View>
                        ))
                )}

                {/* Salary Summary */}
                <View style={styles.salaryCard}>
                    <Text style={styles.salaryTitle}>Monthly Summary</Text>

                    <View style={styles.salaryRow}>
                        <Text style={styles.salaryLabel}>Total Kattalu:</Text>
                        <Text style={styles.salaryValue}>{totalKattalu}</Text>
                    </View>
                    <View style={styles.salaryRow}>
                        <Text style={styles.salaryLabel}>Total Due:</Text>
                        <Text style={styles.salaryValue}>{totalDue}</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.checkboxContainer}
                        onPress={() => setDeductDues(!deductDues)}
                    >
                        <View style={[styles.checkbox, deductDues && styles.checkboxChecked]}>
                            {deductDues && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <Text style={styles.checkboxLabel}>Deduct dues from salary</Text>
                    </TouchableOpacity>

                    <View style={styles.salaryRow}>
                        <Text style={styles.salaryLabel}>Effective Kattalu:</Text>
                        <Text style={styles.salaryValue}>{effectiveKattalu}</Text>
                    </View>
                    <View style={styles.salaryRow}>
                        <Text style={styles.salaryLabel}>Rate per 1000:</Text>
                        <Text style={styles.salaryValue}>₹{branchRate}</Text>
                    </View>

                    <View style={[styles.salaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total Salary:</Text>
                        <Text style={styles.totalValue}>₹{totalSalary.toFixed(2)}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Save Monthly Data</Text>
                </TouchableOpacity>
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
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    backButton: {
        paddingVertical: 8,
        marginBottom: 12,
    },
    backButtonText: {
        color: '#3b82f6',
        fontSize: 16,
        fontWeight: '600',
    },
    workerInfo: {
        marginBottom: 12,
    },
    workerNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    workerCardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    typeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    typeBadgePermanent: {
        backgroundColor: '#d1fae5',
    },
    typeBadgeContract: {
        backgroundColor: '#fef3c7',
    },
    typeBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#374151',
    },
    workerCardSerial: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
    },
    branchName: {
        fontSize: 13,
        color: '#10b981',
        fontWeight: '600',
        marginTop: 6,
    },
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    phoneText: {
        fontSize: 14,
        color: '#1f2937',
        fontWeight: '500',
    },
    callButton: {
        backgroundColor: '#10b981',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    callButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    // Filter Container Styles
    filterContainer: {
        marginTop: 16,
        marginBottom: 12,
        position: 'relative',
        zIndex: 1000,
    },
    filterLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    dropdownButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#3b82f6',
        paddingVertical: 12,
        paddingHorizontal: 16,
        elevation: 3,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    dropdownButtonContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1f2937',
    },
    dropdownArrow: {
        fontSize: 12,
        color: '#3b82f6',
        fontWeight: 'bold',
        transform: [{ rotate: '0deg' }],
    },
    dropdownArrowUp: {
        transform: [{ rotate: '180deg' }],
    },
    dropdownMenu: {
        position: 'absolute',
        top: 80,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        zIndex: 1001,
        overflow: 'hidden',
    },
    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        backgroundColor: '#fff',
    },
    dropdownItemActive: {
        backgroundColor: '#eff6ff',
        borderLeftWidth: 4,
        borderLeftColor: '#3b82f6',
    },
    dropdownItemText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#4b5563',
    },
    dropdownItemTextActive: {
        color: '#1e40af',
        fontWeight: '700',
    },
    checkIcon: {
        fontSize: 18,
        color: '#10b981',
        fontWeight: 'bold',
    },
    // Date Navigation Styles
    dateNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#667eea',
        padding: 16,
        borderRadius: 12,
        marginTop: 12,
        elevation: 4,
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    dateButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 12,
        borderRadius: 10,
        minWidth: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    dateButtonText: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
    },
    dateTextContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    dateRangeText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 4,
    },
    dateRangeSubtext: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    // Current Date Indicator Styles
    currentDateContainer: {
        backgroundColor: '#f0f9ff',
        padding: 14,
        borderRadius: 12,
        marginTop: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#bfdbfe',
        gap: 10,
    },
    todayBadge: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        elevation: 2,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    todayBadgeText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 1,
    },
    currentDateText: {
        fontSize: 13,
        color: '#1e40af',
        fontWeight: '600',
    },
    scrollContent: {
        flex: 1,
    },
    scrollContentContainer: {
        paddingBottom: 32,
    },
    tableHeaderContainer: {
        backgroundColor: '#f9fafb',
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#1f2937',
        padding: 8,
        borderRadius: 8,
        marginHorizontal: 12,
        marginBottom: 0,
        marginTop: 16,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingVertical: 4,
        paddingHorizontal: 16,
    },
    tableCell: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        color: '#1f2937',
        padding: 8,
    },
    dayCell: {
        flex: 0.6,
    },
    headerCell: {
        color: '#fff',
        fontWeight: '600',
    },
    dayNumber: {
        fontWeight: 'bold',
        color: '#1f2937',
        backgroundColor: '#f3f4f6',
    },
    kattaluHeader: {
        backgroundColor: '#10b981',
        color: '#fff',
    },
    dueHeader: {
        backgroundColor: '#ef4444',
        color: '#fff',
    },
    input: {
        backgroundColor: '#fff',
        color: '#1f2937',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 4,
        padding: 4,
    },
    kattaluInput: {
        backgroundColor: '#f0fdf4',
    },
    dueInput: {
        backgroundColor: '#fef2f2',
    },
    salaryCard: {
        backgroundColor: '#10b981',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        marginBottom: 16,
        marginHorizontal: 16,
    },
    salaryTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        opacity: 0.9,
        marginBottom: 12,
    },
    salaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    salaryLabel: {
        fontSize: 14,
        color: '#fff',
    },
    salaryValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.3)',
        marginTop: 8,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 4,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#fff',
    },
    checkmark: {
        color: '#10b981',
        fontWeight: 'bold',
    },
    checkboxLabel: {
        color: '#fff',
        fontSize: 14,
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.3)',
        paddingTop: 8,
        marginTop: 8,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    totalValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    saveButton: {
        backgroundColor: '#10b981',
        padding: 16,
        borderRadius: 12,
        marginHorizontal: 16,
        marginTop: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
});

export default WorkerCardView;
