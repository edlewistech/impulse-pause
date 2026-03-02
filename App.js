import { useMemo, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const IMPULSE_REASONS = [
  'Check messages',
  'Social media',
  'Entertainment',
  'Work / productive',
  'Just bored',
];

const MODES = {
  GATE: 'GATE',
  REFLECT: 'REFLECT',
  RESULT: 'RESULT',
  STATS: 'STATS',
  SETTINGS: 'SETTINGS',
};

export default function App() {
  const [mode, setMode] = useState(MODES.GATE);
  const [selectedReason, setSelectedReason] = useState(null);
  const [lastDecision, setLastDecision] = useState(null); // 'YES' | 'NO'
  const [showReflectionStep, setShowReflectionStep] = useState(true);
  const [autoCloseAfterDecision, setAutoCloseAfterDecision] = useState(true);
  const [entries, setEntries] = useState([]);

  const handleReasonPress = (reason) => {
    const timestamp = Date.now();
    setSelectedReason(reason);

    if (!showReflectionStep) {
      const entry = {
        id: timestamp.toString(),
        reason,
        decision: 'SKIPPED',
        createdAt: timestamp,
      };
      setEntries((prev) => [...prev, entry]);
      setLastDecision('YES');
      setMode(MODES.RESULT);
      return;
    }

    setMode(MODES.REFLECT);
  };

  const handleProceedAnyway = () => {
    const timestamp = Date.now();
    const entry = {
      id: timestamp.toString(),
      reason: null,
      decision: 'PROCEED_ANYWAY',
      createdAt: timestamp,
    };
    setEntries((prev) => [...prev, entry]);
    setLastDecision('YES');
    setSelectedReason(null);
    setMode(MODES.RESULT);
  };

  const handleReflectionDecision = (isIntentional) => {
    const timestamp = Date.now();
    const entry = {
      id: timestamp.toString(),
      reason: selectedReason,
      decision: isIntentional ? 'YES' : 'NO',
      createdAt: timestamp,
    };
    setEntries((prev) => [...prev, entry]);
    setLastDecision(isIntentional ? 'YES' : 'NO');
    setMode(MODES.RESULT);
  };

  const handleResultDismiss = () => {
    setSelectedReason(null);
    setMode(MODES.GATE);
  };

  const handleSkipForNow = () => {
    const timestamp = Date.now();
    const entry = {
      id: timestamp.toString(),
      reason: null,
      decision: 'SKIP',
      createdAt: timestamp,
    };
    setEntries((prev) => [...prev, entry]);
    setLastDecision(null);
    setSelectedReason(null);
    setMode(MODES.GATE);
  };

  const stats = useMemo(() => {
    const totalIntercepts = entries.length;
    const byReason = IMPULSE_REASONS.reduce((acc, reason) => {
      acc[reason] = { total: 0, yes: 0, no: 0 };
      return acc;
    }, {});

    entries.forEach((entry) => {
      if (entry.reason && byReason[entry.reason]) {
        byReason[entry.reason].total += 1;
        if (entry.decision === 'YES') byReason[entry.reason].yes += 1;
        if (entry.decision === 'NO') byReason[entry.reason].no += 1;
      }
    });

    return { totalIntercepts, byReason };
  }, [entries]);

  const renderImpulseGate = () => (
    <View style={styles.screenContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.appTitle}>Impulse Pause</Text>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => setMode(MODES.SETTINGS)}
        >
          <Text style={styles.headerLink}>Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.questionText}>What are you about to do?</Text>
        <Text style={styles.subText}>
          Take a brief pause before using your phone.
        </Text>

        <View style={styles.optionsContainer}>
          {IMPULSE_REASONS.map((reason) => (
            <TouchableOpacity
              key={reason}
              style={styles.reasonButton}
              onPress={() => handleReasonPress(reason)}
            >
              <Text style={styles.reasonButtonText}>{reason}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryButton, styles.proceedButton]}
          onPress={handleProceedAnyway}
        >
          <Text style={styles.primaryButtonText}>Proceed anyway</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleSkipForNow}>
          <Text style={styles.secondaryButtonText}>Skip for now</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMode(MODES.STATS)}>
          <Text style={styles.linkText}>See my patterns</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReflection = () => (
    <View style={styles.screenContainer}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => setMode(MODES.GATE)}>
          <Text style={styles.headerLink}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Check in</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.questionText}>
          You’re about to open{' '}
          <Text style={styles.highlightText}>{selectedReason}</Text>.
        </Text>
        <Text style={styles.subText}>Is this intentional right now?</Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, styles.intentionalButton]}
            onPress={() => handleReflectionDecision(true)}
          >
            <Text style={styles.primaryButtonText}>Yes, it’s intentional</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => handleReflectionDecision(false)}
          >
            <Text style={styles.secondaryButtonText}>No, I’ll wait</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderResult = () => {
    const isYes = lastDecision === 'YES';

    return (
      <View style={styles.screenContainer}>
        <View style={styles.contentCentered}>
          <Text style={styles.resultTitle}>
            {isYes ? 'Go ahead.' : 'Nice job.'}
          </Text>
          <Text style={styles.subText}>
            {isYes
              ? 'You chose to use your phone intentionally.'
              : 'You just interrupted an automatic impulse.'}
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleResultDismiss}
          >
            <Text style={styles.primaryButtonText}>
              {autoCloseAfterDecision ? 'Close' : 'Back to start'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderStats = () => (
    <View style={styles.screenContainer}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => setMode(MODES.GATE)}>
          <Text style={styles.headerLink}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My patterns</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.questionText}>Impulses intercepted</Text>
        <Text style={styles.statsNumber}>{stats.totalIntercepts}</Text>

        <View style={styles.statsList}>
          {IMPULSE_REASONS.map((reason) => {
            const data = stats.byReason[reason];
            if (!data.total) return null;

            return (
              <View key={reason} style={styles.statsItem}>
                <Text style={styles.statsReason}>{reason}</Text>
                <Text style={styles.statsDetail}>
                  {data.total} total · {data.yes} intentional · {data.no} delayed
                </Text>
              </View>
            );
          })}
          {stats.totalIntercepts === 0 && (
            <Text style={styles.subText}>
              Once you’ve logged a few impulses, you’ll see patterns here.
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  const renderSettings = () => (
    <View style={styles.screenContainer}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => setMode(MODES.GATE)}>
          <Text style={styles.headerLink}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.settingRow}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Show reflection step</Text>
            <Text style={styles.settingDescription}>
              Ask “Is this intentional?” after choosing a reason.
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.toggle,
              showReflectionStep && styles.toggleOn,
            ]}
            onPress={() => setShowReflectionStep((prev) => !prev)}
          >
            <View
              style={[
                styles.toggleThumb,
                showReflectionStep && styles.toggleThumbOn,
              ]}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Quick-close after decision</Text>
            <Text style={styles.settingDescription}>
              Return to the start screen right after you decide.
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.toggle,
              autoCloseAfterDecision && styles.toggleOn,
            ]}
            onPress={() => setAutoCloseAfterDecision((prev) => !prev)}
          >
            <View
              style={[
                styles.toggleThumb,
                autoCloseAfterDecision && styles.toggleThumbOn,
              ]}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  let content;
  if (mode === MODES.GATE) content = renderImpulseGate();
  else if (mode === MODES.REFLECT) content = renderReflection();
  else if (mode === MODES.RESULT) content = renderResult();
  else if (mode === MODES.STATS) content = renderStats();
  else if (mode === MODES.SETTINGS) content = renderSettings();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      {content}
    </SafeAreaView>
  );
}

const PRIMARY = '#111827';
const ACCENT = '#6366F1';
const BACKGROUND = '#F3F4F6';
const CARD = '#FFFFFF';
const MUTED = '#6B7280';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  screenContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: PRIMARY,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: PRIMARY,
  },
  headerLink: {
    fontSize: 14,
    fontWeight: '500',
    color: ACCENT,
  },
  content: {
    flex: 1,
  },
  contentCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '600',
    color: PRIMARY,
    marginBottom: 6,
  },
  subText: {
    fontSize: 14,
    color: MUTED,
    marginBottom: 16,
  },
  optionsContainer: {
    marginTop: 8,
  },
  reasonButton: {
    backgroundColor: CARD,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  reasonButtonText: {
    fontSize: 16,
    color: PRIMARY,
  },
  footer: {
    paddingTop: 8,
  },
  primaryButton: {
    backgroundColor: ACCENT,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  proceedButton: {
    backgroundColor: PRIMARY,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 6,
  },
  secondaryButtonText: {
    color: PRIMARY,
    fontSize: 15,
    fontWeight: '500',
  },
  linkText: {
    marginTop: 2,
    fontSize: 13,
    color: ACCENT,
    textAlign: 'center',
  },
  highlightText: {
    fontWeight: '600',
    color: PRIMARY,
  },
  resultTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: PRIMARY,
    marginBottom: 8,
  },
  statsNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: PRIMARY,
    marginTop: 8,
    marginBottom: 16,
  },
  statsList: {
    marginTop: 4,
  },
  statsItem: {
    marginBottom: 10,
  },
  statsReason: {
    fontSize: 15,
    fontWeight: '600',
    color: PRIMARY,
  },
  statsDetail: {
    fontSize: 13,
    color: MUTED,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: PRIMARY,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: MUTED,
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleOn: {
    backgroundColor: '#E0E7FF',
    borderColor: '#A5B4FC',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },
  intentionalButton: {
    marginBottom: 10,
  },
});
