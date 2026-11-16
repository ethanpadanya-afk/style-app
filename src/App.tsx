import React, { useState, useEffect } from 'react';

interface ExerciseLog {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: number;
  weight: number;
  date: string;
}

interface SocialMission {
  id: string;
  title: string;
  difficulty: 'קל' | 'בינוני' | 'מתקדם';
  xp: number;
  completed: boolean;
}

interface UserProfile {
  id: string;
  name: string;
  strengthXp: number;
  charismaXp: number;
  workouts: ExerciseLog[];
  missions: SocialMission[];
}

const DEFAULT_MISSIONS: SocialMission[] = [
  { id: 'm1', title: 'ליצור קשר עין ולחייך למישהי שעוברת לידך', difficulty: 'קל', xp: 20, completed: false },
  { id: 'm2', title: 'לשאול שאלה קצרה וטבעית (למשל בחדר כושר או בהפסקה)', difficulty: 'קל', xp: 30, completed: false },
  { id: 'm3', title: 'לתת מחמאה כנה ומכבדת (על סטייל, נעליים או אנרגיה)', difficulty: 'בינוני', xp: 50, completed: false },
  { id: 'm4', title: 'לפתח שיחה של 2 דקות על נושא משותף', difficulty: 'בינוני', xp: 70, completed: false },
  { id: 'm5', title: 'לבקש אינסטגרם או מספר טלפון בצורה קלילה ומכבדת', difficulty: 'מתקדם', xp: 100, completed: false },
];

const ICEBREAKERS: Record<string, { situation: string; line: string; tip: string }[]> = {
  'חדר כושר': [
    {
      situation: 'ליד מכשיר או משקולות',
      line: '"היי, סליחה על ההפרעה, נשאר לך עוד הרבה סטים כאן או שאפשר להיכנס איתך ביחד?"',
      tip: 'אם יש כימיה טובה בסטים, אפשר להוסיף בסוף: "אגב, אני [השם שלך], את מתאמנת פה קבוע?"',
    },
    {
      situation: 'בסוף האימון / ליד הבר',
      line: '"נראה שהיה לך אימון חזק היום! על מה עבדת?"',
      tip: 'שאלה פתוחה שנותנת לה לספר על עצמה בלי לחץ.',
    },
  ],
  'בית ספר / לימודים / רחוב': [
    {
      situation: 'בהפסקה או בתור לקפה',
      line: '"היי, יש לך המלצה מה הכי שווה להזמין פה? אני תמיד מתלבט"',
      tip: 'פתיחה קלילה ולא מחייבת שמתחילה שיחה טבעית.',
    },
    {
      situation: 'מחמאה על סטייל',
      line: '"היי, חייב להגיד שממש אהבתי את הסטייל של הנעליים/הז׳קט שלך, מאיפה הם?"',
      tip: 'מחמאה על בחירה אופנתית תמיד מתקבלת טוב יותר ממחמאה כללית.',
    },
  ],
  "אינסטגרם / צ'אט": [
    {
      situation: 'תגובה על סטורי מעניין',
      line: '"וואו, המקום הזה נראה מטורף! איפה זה צולם?"',
      tip: 'תמיד עדיף להגיב למשהו ספציפי בסטורי ולא לשלוח רק אימוג׳י.',
    },
    {
      situation: 'המשך שיחה אחרי היכרות קצרה',
      line: '"היה ממש כיף לדבר קודם! מה התוכניות שלך להמשך השבוע?"',
      tip: 'שומר על אנרגיה חיובית ומוביל להצעה להיפגש.',
    },
  ],
};

const PRESET_EXERCISES = [
  { name: 'לחיצת חזה (Bench Press)', muscleGroup: 'חזה' },
  { name: 'סקוואט (Squat)', muscleGroup: 'רגליים' },
  { name: 'מתח (Pull Ups)', muscleGroup: 'גב' },
  { name: 'לחיצת כתפיים', muscleGroup: 'כתפיים' },
  { name: 'כפיפת מרפקים (יד קדמית)', muscleGroup: 'ידיים' },
  { name: 'ריצה / הליכון (20 דק׳)', muscleGroup: 'אירובי' },
];

const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-me',
    name: 'אני (ראשי)',
    strengthXp: 0,
    charismaXp: 0,
    workouts: [],
    missions: DEFAULT_MISSIONS,
  },
];

export default function App() {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('gym_social_app_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [activeUserId, setActiveUserId] = useState<string>(users[0]?.id || 'user-me');
  const [activeTab, setActiveTab] = useState<'gym' | 'social'>('gym');
  const [newUserName, setNewUserName] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);

  // טופס הוספת תרגיל
  const [exerciseName, setExerciseName] = useState(PRESET_EXERCISES[0].name);
  const [muscleGroup, setMuscleGroup] = useState(PRESET_EXERCISES[0].muscleGroup);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(40);

  // קטגוריית משפטי פתיחה
  const [selectedCategory, setSelectedCategory] = useState<string>('חדר כושר');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('gym_social_app_users', JSON.stringify(users));
  }, [users]);

  const currentUser = users.find((u) => u.id === activeUserId) || users[0];

  const totalXp = currentUser.strengthXp + currentUser.charismaXp;
  const level = Math.floor(totalXp / 150) + 1;
  const progressInLevel = ((totalXp % 150) / 150) * 100;

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    const newProfile: UserProfile = {
      id: `user-${Date.now()}`,
      name: newUserName.trim(),
      strengthXp: 0,
      charismaXp: 0,
      workouts: [],
      missions: DEFAULT_MISSIONS.map((m) => ({ ...m })),
    };
    setUsers((prev) => [...prev, newProfile]);
    setActiveUserId(newProfile.id);
    setNewUserName('');
    setShowAddUser(false);
  };

  const handleAddWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseName.trim()) return;

    const newLog: ExerciseLog = {
      id: `ex-${Date.now()}`,
      name: exerciseName,
      muscleGroup,
      sets,
      reps,
      weight,
      date: new Date().toLocaleDateString('he-IL'),
    };

    const earnedXp = sets * 15;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              strengthXp: u.strengthXp + earnedXp,
              workouts: [newLog, ...u.workouts],
            }
          : u
      )
    );
  };

  const handleDeleteWorkout = (workoutId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              workouts: u.workouts.filter((w) => w.id !== workoutId),
            }
          : u
      )
    );
  };

  const toggleMission = (missionId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== currentUser.id) return u;
        let xpDiff = 0;
        const updatedMissions = u.missions.map((m) => {
          if (m.id === missionId) {
            const nextState = !m.completed;
            xpDiff = nextState ? m.xp : -m.xp;
            return { ...m, completed: nextState };
          }
          return m;
        });
        return {
          ...u,
          charismaXp: Math.max(0, u.charismaXp + xpDiff),
          missions: updatedMissions,
        };
      })
    );
  };

  const handleCopyLine = (text: string, idx: number) => {
    navigator.clipboard.writeText(text.replace(/^"|"$/g, ''));
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>
        {/* סרגל עליון: בחירת משתמש וסטטוס */}
        <header style={styles.topBar}>
          <div>
            <span style={styles.badge}>LEVEL UP SYSTEM</span>
            <h1 style={styles.title}>כושר & ביטחון עצמי</h1>
          </div>

          <div style={styles.userSection}>
            <label style={{ fontSize: '13px', color: '#9CA3AF' }}>מתאמן פעיל:</label>
            <select
              value={currentUser.id}
              onChange={(e) => setActiveUserId(e.target.value)}
              style={styles.select}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            <button style={styles.addUserBtn} onClick={() => setShowAddUser(!showAddUser)}>
              + משתמש חדש
            </button>
          </div>
        </header>

        {showAddUser && (
          <form onSubmit={handleAddUser} style={styles.addUserForm}>
            <input
              type="text"
              placeholder="שם החבר / המשתמש..."
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              style={styles.input}
            />
            <button type="submit" style={styles.primaryBtn}>
              צור פרופיל
            </button>
          </form>
        )}

        {/* כרטיס מדדים ורמת דמות */}
        <section style={styles.statsCard}>
          <div style={styles.statsHeader}>
            <div>
              <span style={styles.levelBadge}>רמה {level}</span>
              <span style={{ marginRight: '10px', fontWeight: 'bold', fontSize: '18px' }}>
                {currentUser.name}
              </span>
            </div>
            <span style={{ color: '#9CA3AF', fontSize: '14px' }}>
              סה״כ נקודות: {totalXp} XP
            </span>
          </div>

          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${progressInLevel}%` }} />
          </div>

          <div style={styles.statPills}>
            <div style={styles.pill}>
              <span>💪 כוח (חדר כושר):</span>
              <strong>{currentUser.strengthXp} XP</strong>
            </div>
            <div style={styles.pill}>
              <span>🔥 כריזמה (ביטחון והתחלות):</span>
              <strong>{currentUser.charismaXp} XP</strong>
            </div>
          </div>
        </section>

        {/* כפתורי מעבר בין המצבים */}
        <div style={styles.tabs}>
          <button
            style={activeTab === 'gym' ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab('gym')}
          >
            🏋️‍♂️ ניהול אימוני חדר כושר
          </button>
          <button
            style={activeTab === 'social' ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab('social')}
          >
            💬 ביטחון עצמי והתחלה עם בנות
          </button>
        </div>

        {/* תוכן לשונית 1: חדר כושר */}
        {activeTab === 'gym' && (
          <div style={styles.gridTwo}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>➕ תיעוד סט / תרגיל חדש</h2>
              <form onSubmit={handleAddWorkout} style={styles.form}>
                <label style={styles.label}>בחר תרגיל מוכן או הקלד:</label>
                <select
                  value={exerciseName}
                  onChange={(e) => {
                    const chosen = PRESET_EXERCISES.find((p) => p.name === e.target.value);
                    setExerciseName(e.target.value);
                    if (chosen) setMuscleGroup(chosen.muscleGroup);
                  }}
                  style={styles.input}
                >
                  {PRESET_EXERCISES.map((ex) => (
                    <option key={ex.name} value={ex.name}>
                      {ex.name} ({ex.muscleGroup})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="או כתוב שם תרגיל מותאם אישית..."
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  style={styles.input}
                />

                <div style={styles.rowThree}>
                  <div>
                    <label style={styles.label}>סטים</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={sets}
                      onChange={(e) => setSets(Number(e.target.value))}
                      style={styles.input}
                    />
                  </div>
                  <div>
                    <label style={styles.label}>חזרות</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={reps}
                      onChange={(e) => setReps(Number(e.target.value))}
                      style={styles.input}
                    />
                  </div>
                  <div>
                    <label style={styles.label}>משקל (ק״ג)</label>
                    <input
                      type="number"
                      min={0}
                      max={400}
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      style={styles.input}
                    />
                  </div>
                </div>

                <button type="submit" style={styles.primaryBtn}>
                  שמור תרגיל (+{sets * 15} XP)
                </button>
              </form>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>📋 היסטוריית אימונים ({currentUser.workouts.length})</h2>
              {currentUser.workouts.length === 0 ? (
                <p style={styles.emptyText}>עדיין לא תיעדת אימונים. הוסף תרגיל ראשון כדי לצבור נקודות כוח!</p>
              ) : (
                <div style={styles.list}>
                  {currentUser.workouts.map((w) => (
                    <div key={w.id} style={styles.listItem}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{w.name}</div>
                        <div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>
                          {w.sets} סטים × {w.reps} חזרות | <strong>{w.weight} ק״ג</strong> • {w.date}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteWorkout(w.id)}
                        style={styles.deleteBtn}
                        title="מחק תרגיל"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* תוכן לשונית 2: ביטחון עצמי והתחלה עם בנות */}
        {activeTab === 'social' && (
          <div style={styles.gridTwo}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>🎯 אתגרי ביטחון עצמי ויוזמה</h2>
              <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '14px' }}>
                סמן משימות שביצעת במציאות כדי להעלות את מד הכריזמה והביטחון שלך:
              </p>
              <div style={styles.list}>
                {currentUser.missions.map((mission) => (
                  <div
                    key={mission.id}
                    onClick={() => toggleMission(mission.id)}
                    style={{
                      ...styles.missionItem,
                      borderColor: mission.completed ? '#10B981' : '#374151',
                      backgroundColor: mission.completed ? 'rgba(16, 185, 129, 0.12)' : '#111827',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="checkbox"
                        checked={mission.completed}
                        onChange={() => {}}
                        style={{ width: '18px', height: '18px', accentColor: '#10B981' }}
                      />
                      <span
                        style={{
                          textDecoration: mission.completed ? 'line-through' : 'none',
                          color: mission.completed ? '#9CA3AF' : '#F9FAFB',
                          fontSize: '14px',
                        }}
                      >
                        {mission.title}
                      </span>
                    </div>
                    <span style={styles.xpTag}>+{mission.xp} XP</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>💡 משפטי פתיחה טבעיים וטיפים</h2>
              <div style={styles.categoryRow}>
                {Object.keys(ICEBREAKERS).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={selectedCategory === cat ? styles.catBtnActive : styles.catBtn}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div style={styles.list}>
                {ICEBREAKERS[selectedCategory].map((item, idx) => (
                  <div key={idx} style={styles.icebreakerCard}>
                    <div style={{ fontSize: '12px', color: '#60A5FA', fontWeight: 'bold' }}>
                      סיטואציה: {item.situation}
                    </div>
                    <p style={{ margin: '8px 0', fontSize: '15px', fontWeight: 'bold' }}>{item.line}</p>
                    <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#9CA3AF' }}>
                      טיפ: {item.tip}
                    </p>
                    <button
                      onClick={() => handleCopyLine(item.line, idx)}
                      style={styles.copyBtn}
                    >
                      {copiedIndex === idx ? '✓ הועתק!' : '📋 העתק משפט'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    direction: 'rtl',
    minHeight: '100vh',
    backgroundColor: '#0B0F19',
    color: '#F9FAFB',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '24px 16px',
  },
  wrapper: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '20px',
  },
  badge: {
    backgroundColor: '#1E3A8A',
    color: '#93C5FD',
    padding: '4px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  title: {
    margin: '6px 0 0 0',
    fontSize: '26px',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#1F2937',
    padding: '10px 14px',
    borderRadius: '12px',
  },
  select: {
    backgroundColor: '#111827',
    color: '#FFF',
    border: '1px solid #374151',
    padding: '6px 10px',
    borderRadius: '8px',
    fontSize: '14px',
  },
  addUserBtn: {
    backgroundColor: '#374151',
    color: '#FFF',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  addUserForm: {
    display: 'flex',
    gap: '10px',
    marginBottom: '16px',
    backgroundColor: '#1F2937',
    padding: '12px',
    borderRadius: '12px',
  },
  statsCard: {
    backgroundColor: '#1F2937',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '20px',
    border: '1px solid #374151',
  },
  statsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  levelBadge: {
    backgroundColor: '#F59E0B',
    color: '#111827',
    fontWeight: 'bold',
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '13px',
  },
  progressTrack: {
    width: '100%',
    height: '10px',
    backgroundColor: '#111827',
    borderRadius: '999px',
    overflow: 'hidden',
    marginBottom: '14px',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #3B82F6, #10B981)',
    transition: 'width 0.3s ease',
  },
  statPills: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  pill: {
    backgroundColor: '#111827',
    padding: '8px 14px',
    borderRadius: '10px',
    fontSize: '14px',
    display: 'flex',
    gap: '8px',
  },
  tabs: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
  },
  tab: {
    flex: 1,
    padding: '14px',
    backgroundColor: '#1F2937',
    color: '#9CA3AF',
    border: '1px solid #374151',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  tabActive: {
    flex: 1,
    padding: '14px',
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    border: '1px solid #3B82F6',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: '#1F2937',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #374151',
  },
  cardTitle: {
    margin: '0 0 16px 0',
    fontSize: '18px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    color: '#D1D5DB',
    marginBottom: '4px',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: '#111827',
    color: '#FFF',
    border: '1px solid #374151',
    padding: '10px 12px',
    borderRadius: '8px',
    fontSize: '14px',
  },
  rowThree: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '10px',
  },
  primaryBtn: {
    backgroundColor: '#10B981',
    color: '#064E3B',
    fontWeight: 'bold',
    border: 'none',
    padding: '12px',
    borderRadius: '10px',
    fontSize: '15px',
    cursor: 'pointer',
    marginTop: '4px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  listItem: {
    backgroundColor: '#111827',
    padding: '12px 14px',
    borderRadius: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid #374151',
  },
  deleteBtn: {
    backgroundColor: 'transparent',
    color: '#EF4444',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px 8px',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: '14px',
    textAlign: 'center',
    padding: '20px 0',
  },
  missionItem: {
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #374151',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    gap: '10px',
  },
  xpTag: {
    backgroundColor: '#374151',
    color: '#FBBF24',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  },
  categoryRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '14px',
  },
  catBtn: {
    backgroundColor: '#111827',
    color: '#9CA3AF',
    border: '1px solid #374151',
    padding: '6px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  catBtnActive: {
    backgroundColor: '#3B82F6',
    color: '#FFF',
    border: '1px solid #60A5FA',
    padding: '6px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
  },
  icebreakerCard: {
    backgroundColor: '#111827',
    padding: '14px',
    borderRadius: '10px',
    border: '1px solid #374151',
  },
  copyBtn: {
    backgroundColor: '#1F2937',
    color: '#E5E7EB',
    border: '1px solid #4B5563',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
  },
};