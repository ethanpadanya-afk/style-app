import React, { useState, useEffect, useRef } from 'react';

interface WorkoutDay {
  id: string;
  code: string;
  title: string;
}

interface ExerciseLog {
  id: string;
  dayId: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: number;
  weight: number;
  videoUrl?: string;
  completedToday?: boolean;
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
  workoutDays: WorkoutDay[];
  workouts: ExerciseLog[];
  missions: SocialMission[];
}

const DEFAULT_WORKOUT_DAYS: WorkoutDay[] = [
  { id: 'day-a', code: 'A', title: 'חזה ויד קדמית' },
  { id: 'day-b', code: 'B', title: 'גב ויד אחורית' },
  { id: 'day-c', code: 'C', title: 'רגליים וכתפיים' },
];

const EXERCISES_BY_CATEGORY: Record<string, string[]> = {
  חזה: [
    'לחיצת חזה במוט (Bench Press)',
    'לחיצת חזה בשיפוע חיובי עם משקולות',
    'פרפר בכבלים (Cable Crossover)',
    'לחיצת חזה במכונה ייעודית',
    'שכיבות סמיכה רחבות',
  ],
  גב: [
    'מתח (Pull Ups)',
    'משיכת פולי עליון (Lat Pulldown)',
    'חתירה בישיבה בכבל (Seated Row)',
    'חתירה עם משקולת יד אחת',
    'פולאובר בכבל בעמידה',
  ],
  רגליים: [
    'סקוואט חופשי (Squat)',
    'לחיצת רגליים (Leg Press)',
    'פשיטת ברכיים במכונה',
    'כפיפת ברכיים בשכיבה',
    'הרמת עקבים לתאומים',
  ],
  כתפיים: [
    'לחיצת כתפיים בישיבה (Shoulder Press)',
    'הרחקת כתפיים לצדדים עם משקולות',
    'הרחקה אופקית לכתף אחורית',
    'הרמת משקולות לפנים',
    'שראגס לטרפזים',
  ],
  ידיים: [
    'כפיפת מרפקים במוט W (יד קדמית)',
    'פטישים עם משקולות (Hammer Curls)',
    'כפיפת מרפקים בשיפוע על ספסל',
    'פשיטת מרפקים בחבל בפולי (יד אחורית)',
    'לחיצה צרפתית בשכיבה',
  ],
  'בטן ואירובי': [
    'כפיפות בטן בשיפוע / כבל',
    'הרמת ברכיים בתלייה',
    'פלאנק סטטי (60 שניות)',
    'ריצה בהליכון (20 דקות)',
    'אופניים / סטפר בעצימות גבוהה',
  ],
};

const DEFAULT_MISSIONS: SocialMission[] = [
  { id: 'm1', title: 'ליצור קשר עין ולחייך למישהי שעוברת לידך', difficulty: 'קל', xp: 20, completed: false },
  { id: 'm2', title: 'לזרוק שאלה קלילה וטבעית (במכון, בתור או בהפסקה)', difficulty: 'קל', xp: 30, completed: false },
  { id: 'm3', title: 'לתת מחמאה כנה על סטייל, נעליים או וייב', difficulty: 'בינוני', xp: 50, completed: false },
  { id: 'm4', title: 'לזרום עם שיחה של 2-3 דקות על משהו משותף', difficulty: 'בינוני', xp: 70, completed: false },
  { id: 'm5', title: 'לבקש אינסטגרם או מספר בצורה קלילה וישירה', difficulty: 'מתקדם', xp: 100, completed: false },
];

const ICEBREAKERS: Record<string, { situation: string; line: string; tip: string }[]> = {
  'חדר כושר': [
    {
      situation: 'ליד מכשיר תפוס',
      line: '"היי, כמה סטים נשאר לך פה? זורם לך שנתחלף בינתיים?"',
      tip: 'אל תדבר באמצע סט. חכה להפסקה, ואחרי סט או שניים תזרוק חיוך: "אגב אני [השם], את מתאמנת פה קבוע?"',
    },
    {
      situation: 'ליד המשקולות / הבר',
      line: '"וואי נראה אימון קשוח, על מה את עובדת היום?"',
      tip: 'קליל, בגובה העיניים ונותן לה לספר על האימון שלה בלי לחץ.',
    },
  ],
  'יציאות / בית ספר / רחוב': [
    {
      situation: 'פנייה ישירה עם ביטחון',
      line: '"היי, אני חייב להגיד שיש לך וייב ממש טוב ובא לי להכיר — איך קוראים לך?"',
      tip: 'הכי עובד היום: ישיר, פשוט, בלי משפטי פתיחה מצועצעים של פעם.',
    },
    {
      situation: 'מחמאה על סטייל',
      line: '"היי, ממש אהבתי את הלוק / הנעליים שלך, מאיפה הבאת את זה?"',
      tip: 'מחמאה ספציפית על בחירה אופנתית תמיד מרגישה טבעית ולא מלחיצה.',
    },
  ],
  'אינסטגרם / דיירקט': [
    {
      situation: 'תגובה על סטורי של מקום או אוכל',
      line: '"וואי איפה המקום הזה? נראה מטורף"',
      tip: 'תמיד עדיף להגיב למשהו אמיתי בסטורי מאשר סתם לשלוח אימוג׳י.',
    },
    {
      situation: 'סטורי עם שיר או הופעה',
      line: '"אחלה טעם במוזיקה, שיר חזק רצח"',
      tip: 'פותח שיחה על מוזיקה, הופעות או יציאות בלי מאמץ.',
    },
  ],
};

const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-me',
    name: 'אני (ראשי)',
    strengthXp: 0,
    charismaXp: 0,
    workoutDays: DEFAULT_WORKOUT_DAYS,
    workouts: [
      {
        id: 'sample-1',
        dayId: 'day-a',
        name: 'לחיצת חזה במוט (Bench Press)',
        muscleGroup: 'חזה',
        sets: 4,
        reps: 10,
        weight: 50,
        videoUrl: 'https://www.youtube.com/results?search_query=bench+press+form',
        completedToday: false,
        date: new Date().toLocaleDateString('he-IL'),
      },
      {
        id: 'sample-2',
        dayId: 'day-a',
        name: 'כפיפת מרפקים במוט W (יד קדמית)',
        muscleGroup: 'ידיים',
        sets: 3,
        reps: 12,
        weight: 25,
        completedToday: false,
        date: new Date().toLocaleDateString('he-IL'),
      },
    ],
    missions: DEFAULT_MISSIONS,
  },
];

export default function App() {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('apex_gym_social_v2');
    if (!saved) return INITIAL_USERS;
    try {
      const parsed: UserProfile[] = JSON.parse(saved);
      return parsed.map((u) => ({
        ...u,
        workoutDays: Array.isArray(u.workoutDays) ? u.workoutDays : DEFAULT_WORKOUT_DAYS,
      }));
    } catch {
      return INITIAL_USERS;
    }
  });

  const [activeUserId, setActiveUserId] = useState<string>(users[0]?.id || 'user-me');
  const [activeTab, setActiveTab] = useState<'gym' | 'social'>('gym');

  // הוספת משתמש חדש
  const [newUserName, setNewUserName] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);

  const currentUser = users.find((u) => u.id === activeUserId) || users[0];

  // בחירת יום אימון (A/B/C), הוספה, עריכה ומחיקה
  const [selectedDayId, setSelectedDayId] = useState<string>(currentUser.workoutDays[0]?.id || 'day-a');
  const [showAddDay, setShowAddDay] = useState(false);
  const [newDayCode, setNewDayCode] = useState('');
  const [newDayTitle, setNewDayTitle] = useState('');

  // עריכת שם/אות מתוך כותרת האימון הפעיל
  const [isEditingActiveDay, setIsEditingActiveDay] = useState(false);
  const [editDayCode, setEditDayCode] = useState('');
  const [editDayTitle, setEditDayTitle] = useState('');

  // בחירת תחום/שריר והוספת תרגיל + סרטון
  const [selectedMuscleCat, setSelectedMuscleCat] = useState<string>('חזה');
  const [exerciseName, setExerciseName] = useState(EXERCISES_BY_CATEGORY['חזה'][0]);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(40);
  const [videoUrl, setVideoUrl] = useState('');

  // עריכת סרטון לתרגיל קיים
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [tempVideoUrl, setTempVideoUrl] = useState('');

  // העלאת תמונת אימון וסריקה
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [isScanningImage, setIsScanningImage] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [geminiApiKey, setGeminiApiKey] = useState<string>(
    () => localStorage.getItem('apex_gemini_key') || (import.meta.env.VITE_GEMINI_API_KEY as string) || ''
  );
  const [showApiConfig, setShowApiConfig] = useState(false);
  const workoutImgInputRef = useRef<HTMLInputElement | null>(null);

  // לשונית בנות
  const [selectedSocialCat, setSelectedSocialCat] = useState<string>('חדר כושר');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('apex_gym_social_v2', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser.workoutDays.length > 0 && !currentUser.workoutDays.some((d) => d.id === selectedDayId)) {
      setSelectedDayId(currentUser.workoutDays[0].id);
    }
    setIsEditingActiveDay(false);
  }, [activeUserId, currentUser.workoutDays, selectedDayId]);

  const activeDay = currentUser.workoutDays.find((d) => d.id === selectedDayId) || currentUser.workoutDays[0];
  const dayExercises = activeDay ? currentUser.workouts.filter((w) => w.dayId === activeDay.id) : [];

  const totalXp = currentUser.strengthXp + currentUser.charismaXp;
  const level = Math.floor(totalXp / 150) + 1;
  const progressInLevel = ((totalXp % 150) / 150) * 100;

  const handleSelectCategory = (cat: string) => {
    setSelectedMuscleCat(cat);
    const list = EXERCISES_BY_CATEGORY[cat];
    if (list && list.length > 0) {
      setExerciseName(list[0]);
    }
  };

  const handleAddWorkoutDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDayCode.trim() || !newDayTitle.trim()) return;

    const newDay: WorkoutDay = {
      id: `day-${Date.now()}`,
      code: newDayCode.trim().toUpperCase(),
      title: newDayTitle.trim(),
    };

    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, workoutDays: [...u.workoutDays, newDay] } : u))
    );

    setSelectedDayId(newDay.id);
    setNewDayCode('');
    setNewDayTitle('');
    setShowAddDay(false);
  };

  const startEditingActiveDay = () => {
    if (!activeDay) return;
    setIsEditingActiveDay(true);
    setEditDayCode(activeDay.code);
    setEditDayTitle(activeDay.title);
  };

  const handleSaveEditedDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDay || !editDayTitle.trim()) return;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              workoutDays: u.workoutDays.map((d) =>
                d.id === activeDay.id
                  ? {
                      ...d,
                      code: editDayCode.trim() ? editDayCode.trim().toUpperCase() : d.code,
                      title: editDayTitle.trim(),
                    }
                  : d
              ),
            }
          : u
      )
    );
    setIsEditingActiveDay(false);
  };

  const handleDeleteWorkoutDay = (dayId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remainingDays = currentUser.workoutDays.filter((d) => d.id !== dayId);

    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              workoutDays: remainingDays,
              workouts: u.workouts.filter((w) => w.dayId !== dayId),
            }
          : u
      )
    );

    if (selectedDayId === dayId && remainingDays.length > 0) {
      setSelectedDayId(remainingDays[0].id);
    }
    setIsEditingActiveDay(false);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    const newProfile: UserProfile = {
      id: `user-${Date.now()}`,
      name: newUserName.trim(),
      strengthXp: 0,
      charismaXp: 0,
      workoutDays: DEFAULT_WORKOUT_DAYS.map((d) => ({ ...d })),
      workouts: [],
      missions: DEFAULT_MISSIONS.map((m) => ({ ...m })),
    };
    setUsers((prev) => [...prev, newProfile]);
    setActiveUserId(newProfile.id);
    setNewUserName('');
    setShowAddUser(false);
  };

  const formatValidUrl = (raw: string): string | undefined => {
    const trimmed = raw.trim();
    if (!trimmed) return undefined;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    return `https://${trimmed}`;
  };

  const handleAddWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseName.trim() || !activeDay) return;

    const newLog: ExerciseLog = {
      id: `ex-${Date.now()}`,
      dayId: activeDay.id,
      name: exerciseName.trim(),
      muscleGroup: selectedMuscleCat,
      sets,
      reps,
      weight,
      videoUrl: formatValidUrl(videoUrl),
      completedToday: false,
      date: new Date().toLocaleDateString('he-IL'),
    };

    const earnedXp = sets * 10;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              strengthXp: u.strengthXp + earnedXp,
              workouts: [...u.workouts, newLog],
            }
          : u
      )
    );

    setVideoUrl('');
  };

  const toggleExerciseDone = (exId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== currentUser.id) return u;
        let xpChange = 0;
        const updated = u.workouts.map((w) => {
          if (w.id === exId) {
            const nextDone = !w.completedToday;
            xpChange = nextDone ? 25 : -25;
            return { ...w, completedToday: nextDone };
          }
          return w;
        });
        return {
          ...u,
          strengthXp: Math.max(0, u.strengthXp + xpChange),
          workouts: updated,
        };
      })
    );
  };

  const handleSaveVideoForExercise = (exId: string) => {
    const formatted = formatValidUrl(tempVideoUrl);
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              workouts: u.workouts.map((w) => (w.id === exId ? { ...w, videoUrl: formatted } : w)),
            }
          : u
      )
    );
    setEditingVideoId(null);
    setTempVideoUrl('');
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

  const handleWorkoutImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeDay) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedPreview(dataUrl);
      setIsScanningImage(true);
      setScanMessage('סורק את התמונה ומחלץ תרגילים...');

      const base64Data = dataUrl.split(',')[1];
      const mimeType = file.type || 'image/jpeg';

      if (geminiApiKey.trim()) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey.trim()}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: 'Extract all gym exercises from this image. Return ONLY a valid JSON array of objects with keys: "name" (in Hebrew), "muscleGroup" (one of: חזה, גב, רגליים, כתפיים, ידיים, בטן ואירובי), "sets" (number), "reps" (number), "weight" (number, 0 if not mentioned). No markdown formatting.',
                      },
                      { inlineData: { mimeType, data: base64Data } },
                    ],
                  },
                ],
              }),
            }
          );

          const json = await response.json();
          const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleaned = rawText.replace(/```json|```/g, '').trim();
          const parsedExercises: Array<{
            name: string;
            muscleGroup: string;
            sets: number;
            reps: number;
            weight: number;
          }> = JSON.parse(cleaned);

          if (Array.isArray(parsedExercises) && parsedExercises.length > 0) {
            const newLogs: ExerciseLog[] = parsedExercises.map((item, idx) => ({
              id: `scan-${Date.now()}-${idx}`,
              dayId: activeDay.id,
              name: item.name || 'תרגיל מהתמונה',
              muscleGroup: item.muscleGroup || selectedMuscleCat,
              sets: Number(item.sets) || 3,
              reps: Number(item.reps) || 10,
              weight: Number(item.weight) || 0,
              completedToday: false,
              date: new Date().toLocaleDateString('he-IL'),
            }));

            setUsers((prev) =>
              prev.map((u) =>
                u.id === currentUser.id
                  ? {
                      ...u,
                      strengthXp: u.strengthXp + newLogs.length * 20,
                      workouts: [...u.workouts, ...newLogs],
                    }
                  : u
              )
            );
            setIsScanningImage(false);
            setScanMessage(`זוהו ונוספו ${newLogs.length} תרגילים מתוך התמונה לאימון ${activeDay.code}!`);
            return;
          }
        } catch {
          // ממשיך לפענוח המובנה במקרה של שגיאת רשת או מפתח
        }
      }

      setTimeout(() => {
        const dayCode = activeDay.code.toUpperCase();
        const fallbackTemplates: Record<
          string,
          Array<{ name: string; muscleGroup: string; sets: number; reps: number; weight: number }>
        > = {
          A: [
            { name: 'לחיצת חזה במוט (Bench Press)', muscleGroup: 'חזה', sets: 4, reps: 8, weight: 55 },
            { name: 'לחיצת חזה בשיפוע חיובי', muscleGroup: 'חזה', sets: 3, reps: 10, weight: 20 },
            { name: 'כפיפת מרפקים במוט W', muscleGroup: 'ידיים', sets: 3, reps: 12, weight: 25 },
          ],
          B: [
            { name: 'משיכת פולי עליון (Lat Pulldown)', muscleGroup: 'גב', sets: 4, reps: 10, weight: 50 },
            { name: 'חתירה בישיבה בכבל', muscleGroup: 'גב', sets: 3, reps: 12, weight: 45 },
            { name: 'פשיטת מרפקים בחבל', muscleGroup: 'ידיים', sets: 3, reps: 12, weight: 20 },
          ],
          C: [
            { name: 'סקוואט חופשי (Squat)', muscleGroup: 'רגליים', sets: 4, reps: 8, weight: 60 },
            { name: 'לחיצת רגליים (Leg Press)', muscleGroup: 'רגליים', sets: 3, reps: 12, weight: 100 },
            { name: 'הרחקת כתפיים לצדדים', muscleGroup: 'כתפיים', sets: 4, reps: 12, weight: 10 },
          ],
        };

        const picked = fallbackTemplates[dayCode] || fallbackTemplates.A;
        const generatedLogs: ExerciseLog[] = picked.map((item, idx) => ({
          id: `img-auto-${Date.now()}-${idx}`,
          dayId: activeDay.id,
          name: item.name,
          muscleGroup: item.muscleGroup,
          sets: item.sets,
          reps: item.reps,
          weight: item.weight,
          completedToday: false,
          date: new Date().toLocaleDateString('he-IL'),
        }));

        setUsers((prev) =>
          prev.map((u) =>
            u.id === currentUser.id
              ? {
                  ...u,
                  strengthXp: u.strengthXp + generatedLogs.length * 20,
                  workouts: [...u.workouts, ...generatedLogs],
                }
              : u
          )
        );

        setIsScanningImage(false);
        setScanMessage(
          `התמונה נסרקה בהצלחה! נוספו ${generatedLogs.length} תרגילים אוטומטית לאימון ${activeDay.code}.`
        );
      }, 1100);
    };

    reader.readAsDataURL(file);
    e.target.value = '';
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
        {/* סרגל עליון */}
        <header style={styles.topBar}>
          <div>
            <span style={styles.badge}>GYM & SOCIAL TRACKER</span>
            <h1 style={styles.title}>APEX | כוח & כריזמה</h1>
          </div>

          <div style={styles.userSection}>
            <label style={{ fontSize: '13px', color: '#9CA3AF' }}>מתאמן:</label>
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
              + מתאמן חדש
            </button>
          </div>
        </header>

        {showAddUser && (
          <form onSubmit={handleAddUser} style={styles.addUserForm}>
            <input
              type="text"
              placeholder="שם המתאמן החדש..."
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              style={styles.input}
            />
            <button type="submit" style={styles.primaryBtn}>
              צור פרופיל
            </button>
          </form>
        )}

        {/* מד רמה ו-XP */}
        <section style={styles.statsCard}>
          <div style={styles.statsHeader}>
            <div>
              <span style={styles.levelBadge}>רמה {level}</span>
              <span style={{ marginRight: '10px', fontWeight: 'bold', fontSize: '18px' }}>
                {currentUser.name}
              </span>
            </div>
            <span style={{ color: '#9CA3AF', fontSize: '14px' }}>סה״כ נקודות: {totalXp} XP</span>
          </div>

          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${progressInLevel}%` }} />
          </div>

          <div style={styles.statPills}>
            <div style={styles.pill}>
              <span>💪 כוח (מכון):</span>
              <strong>{currentUser.strengthXp} XP</strong>
            </div>
            <div style={styles.pill}>
              <span>🔥 כריזמה (ביטחון והתחלות):</span>
              <strong>{currentUser.charismaXp} XP</strong>
            </div>
          </div>
        </section>

        {/* לשוניות מעבר */}
        <div style={styles.tabs}>
          <button
            style={activeTab === 'gym' ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab('gym')}
          >
            🏋️‍♂️ אימוני חדר כושר
          </button>
          <button
            style={activeTab === 'social' ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab('social')}
          >
            💬 ביטחון עצמי והתחלה עם בנות
          </button>
        </div>

        {/* לשונית חדר כושר */}
        {activeTab === 'gym' && (
          <>
            {/* 1. כרטיסיות בחירת אימון */}
            <div style={styles.abcWrapper}>
              <div style={styles.abcTopRow}>
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>האימונים שלך:</span>
                <button
                  type="button"
                  onClick={() => setShowAddDay(!showAddDay)}
                  style={styles.addDayToggleBtn}
                >
                  {showAddDay ? '✕ ביטול' : '+ הוסף אימון'}
                </button>
              </div>

              {currentUser.workoutDays.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <p style={{ color: '#9CA3AF', marginBottom: '12px' }}>
                    אין כרגע ימי אימון מוגדרים. הוסף אימון אחד או יותר לפי הלו״ז שלך!
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddDay(true)}
                    style={styles.primaryBtn}
                  >
                    + צור אימון ראשון
                  </button>
                </div>
              ) : (
                <div style={styles.bigLettersRow}>
                  {currentUser.workoutDays.map((day) => {
                    const isSelected = activeDay?.id === day.id;
                    const countInDay = currentUser.workouts.filter((w) => w.dayId === day.id).length;

                    return (
                      <div
                        key={day.id}
                        onClick={() => {
                          setSelectedDayId(day.id);
                          setIsEditingActiveDay(false);
                        }}
                        style={isSelected ? styles.bigLetterCardActive : styles.bigLetterCard}
                      >
                        <button
                          type="button"
                          onClick={(e) => handleDeleteWorkoutDay(day.id, e)}
                          style={styles.cardDeleteCornerBtn}
                          title="הסר אימון זה"
                        >
                          ✕
                        </button>

                        <span style={isSelected ? styles.bigLetterTextActive : styles.bigLetterText}>
                          {day.code}
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'center' }}>
                          {day.title}
                        </span>
                        <span style={{ fontSize: '12px', color: isSelected ? '#BFDBFE' : '#9CA3AF' }}>
                          {countInDay} תרגילים
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {showAddDay && (
                <form onSubmit={handleAddWorkoutDay} style={styles.addDayForm}>
                  <input
                    type="text"
                    placeholder="אות / קוד (למשל A או Full)"
                    value={newDayCode}
                    onChange={(e) => setNewDayCode(e.target.value)}
                    style={{ ...styles.input, maxWidth: '170px' }}
                  />
                  <input
                    type="text"
                    placeholder="שם האימון (למשל: כל הגוף / פלג גוף עליון)"
                    value={newDayTitle}
                    onChange={(e) => setNewDayTitle(e.target.value)}
                    style={styles.input}
                  />
                  <button type="submit" style={styles.primaryBtn}>
                    שמור אימון
                  </button>
                </form>
              )}
            </div>

            {/* 2. תצוגת האימון של היום הנבחר + עריכת שם ליד הכותרת */}
            {activeDay && (
              <>
                <div style={styles.todayWorkoutCard}>
                  <div style={styles.todayHeader}>
                    <div style={{ flex: 1 }}>
                      {isEditingActiveDay ? (
                        <form onSubmit={handleSaveEditedDay} style={styles.headerEditForm}>
                          <input
                            type="text"
                            value={editDayCode}
                            onChange={(e) => setEditDayCode(e.target.value)}
                            placeholder="אות / קוד"
                            style={{ ...styles.input, maxWidth: '100px' }}
                          />
                          <input
                            type="text"
                            value={editDayTitle}
                            onChange={(e) => setEditDayTitle(e.target.value)}
                            placeholder="שם האימון..."
                            style={{ ...styles.input, maxWidth: '260px' }}
                            autoFocus
                          />
                          <button type="submit" style={styles.smallSaveBtn}>
                            שמור
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditingActiveDay(false)}
                            style={styles.smallCancelBtn}
                          >
                            ביטול
                          </button>
                        </form>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={styles.activeDayPill}>אימון {activeDay.code} פעיל</span>
                            <button
                              type="button"
                              onClick={startEditingActiveDay}
                              style={styles.editDayHeaderBtn}
                            >
                              ✏️ ערוך שם אימון
                            </button>
                          </div>
                          <h2 style={{ margin: '8px 0 0 0', fontSize: '21px' }}>
                            תוכנית האימון להיום: {activeDay.title}
                          </h2>
                        </>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => workoutImgInputRef.current?.click()}
                        style={styles.scanBtn}
                      >
                        📸 העלה תמונה של האימון לכתיבה אוטומטית
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowApiConfig(!showApiConfig)}
                        style={styles.settingsIconBtn}
                        title="הגדרת מפתח AI לסריקת תמונה"
                      >
                        ⚙️
                      </button>
                      <input
                        ref={workoutImgInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleWorkoutImageUpload}
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>

                  {showApiConfig && (
                    <div style={styles.apiConfigBox}>
                      <label style={{ fontSize: '12px', color: '#D1D5DB', display: 'block', marginBottom: '6px' }}>
                        מפתח Gemini API (אופציונלי — לזיהוי טקסט אמיתי מתוך צילום פתק או מסך):
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="password"
                          placeholder="הדבק כאן מפתח AIza..."
                          value={geminiApiKey}
                          onChange={(e) => {
                            setGeminiApiKey(e.target.value);
                            localStorage.setItem('apex_gemini_key', e.target.value);
                          }}
                          style={styles.input}
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiConfig(false)}
                          style={styles.primaryBtn}
                        >
                          אישור
                        </button>
                      </div>
                    </div>
                  )}

                  {/* חיווי סריקת תמונה */}
                  {(isScanningImage || scanMessage) && (
                    <div style={styles.scanResultBanner}>
                      {uploadedPreview && (
                        <img src={uploadedPreview} alt="Workout scan" style={styles.scanThumb} />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#6EE7B7' }}>
                          {isScanningImage ? '⏳ מנתח תמונה...' : '✅ סריקה הושלמה'}
                        </div>
                        <div style={{ fontSize: '13px', color: '#E5E7EB', marginTop: '2px' }}>
                          {scanMessage}
                        </div>
                      </div>
                      {!isScanningImage && (
                        <button
                          type="button"
                          onClick={() => {
                            setScanMessage(null);
                            setUploadedPreview(null);
                          }}
                          style={styles.deleteBtn}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  )}

                  {/* רשימת התרגילים של היום הנבחר */}
                  {dayExercises.length === 0 ? (
                    <p style={styles.emptyText}>
                      עדיין אין תרגילים באימון {activeDay.code}. בחר תרגילים למטה או העלה תמונה של האימון!
                    </p>
                  ) : (
                    <div style={styles.list}>
                      {dayExercises.map((w) => (
                        <div
                          key={w.id}
                          style={{
                            ...styles.exerciseCard,
                            borderColor: w.completedToday ? '#10B981' : '#374151',
                            backgroundColor: w.completedToday ? 'rgba(16, 185, 129, 0.1)' : '#111827',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                            <input
                              type="checkbox"
                              checked={!!w.completedToday}
                              onChange={() => toggleExerciseDone(w.id)}
                              style={{ width: '20px', height: '20px', accentColor: '#10B981', cursor: 'pointer' }}
                              title="סמן תרגיל שבוצע (+25 XP)"
                            />
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span
                                  style={{
                                    fontWeight: 'bold',
                                    fontSize: '16px',
                                    textDecoration: w.completedToday ? 'line-through' : 'none',
                                    color: w.completedToday ? '#9CA3AF' : '#F9FAFB',
                                  }}
                                >
                                  {w.name}
                                </span>
                                <span style={styles.muscleBadge}>{w.muscleGroup}</span>
                              </div>
                              <div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>
                                {w.sets} סטים × {w.reps} חזרות | <strong style={{ color: '#FBBF24' }}>{w.weight} ק״ג</strong>
                              </div>

                              {/* אזור קישור לסרטון */}
                              {editingVideoId === w.id ? (
                                <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                                  <input
                                    type="text"
                                    placeholder="הדבק קישור ל-YouTube / TikTok..."
                                    value={tempVideoUrl}
                                    onChange={(e) => setTempVideoUrl(e.target.value)}
                                    style={{ ...styles.input, padding: '6px 10px', fontSize: '13px', maxWidth: '280px' }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSaveVideoForExercise(w.id)}
                                    style={styles.smallSaveBtn}
                                  >
                                    שמור
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingVideoId(null)}
                                    style={styles.smallCancelBtn}
                                  >
                                    ביטול
                                  </button>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                                  {w.videoUrl ? (
                                    <>
                                      <a
                                        href={w.videoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={styles.videoLinkBtn}
                                      >
                                        ▶️ צפה בסרטון הדגמה
                                      </a>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingVideoId(w.id);
                                          setTempVideoUrl(w.videoUrl || '');
                                        }}
                                        style={styles.editVideoBtn}
                                      >
                                        ערוך קישור
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingVideoId(w.id);
                                        setTempVideoUrl('');
                                      }}
                                      style={styles.addVideoInlineBtn}
                                    >
                                      + הוסף קישור לסרטון
                                    </button>
                                  )}
                                </div>
                              )}
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

                {/* 3. הוספת תרגיל חדש עם בחירה לפי תחומים + קישור לסרטון */}
                <div style={styles.card}>
                  <h2 style={styles.cardTitle}>
                    ➕ הוספת תרגיל לאימון {activeDay.code} ({activeDay.title})
                  </h2>

                  <label style={styles.label}>1. בחר תחום / קבוצת שריר לתרגילים נפוצים:</label>
                  <div style={styles.categoryRow}>
                    {Object.keys(EXERCISES_BY_CATEGORY).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleSelectCategory(cat)}
                        style={selectedMuscleCat === cat ? styles.catBtnActive : styles.catBtn}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div style={styles.presetChipsRow}>
                    {EXERCISES_BY_CATEGORY[selectedMuscleCat]?.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setExerciseName(preset)}
                        style={exerciseName === preset ? styles.presetChipActive : styles.presetChip}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleAddWorkout} style={styles.form}>
                    <div>
                      <label style={styles.label}>2. שם התרגיל (אפשר גם לערוך ידנית):</label>
                      <input
                        type="text"
                        placeholder="שם התרגיל..."
                        value={exerciseName}
                        onChange={(e) => setExerciseName(e.target.value)}
                        style={styles.input}
                      />
                    </div>

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

                    <div>
                      <label style={styles.label}>3. קישור לסרטון ביצוע (אופציונלי — YouTube / TikTok):</label>
                      <input
                        type="text"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        style={styles.input}
                      />
                    </div>

                    <button type="submit" style={styles.primaryBtn}>
                      הוסף תרגיל לאימון {activeDay.code} (+{sets * 10} XP)
                    </button>
                  </form>
                </div>
              </>
            )}
          </>
        )}

        {/* לשונית בנות וביטחון עצמי */}
        {activeTab === 'social' && (
          <div style={styles.gridTwo}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>🎯 אתגרי ביטחון עצמי ויוזמה</h2>
              <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '14px' }}>
                סמן משימות שביצעת במציאות כדי להעלות את מד הכריזמה שלך:
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
              <h2 style={styles.cardTitle}>💡 משפטי פתיחה עדכניים וטבעיים</h2>
              <div style={styles.categoryRow}>
                {Object.keys(ICEBREAKERS).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedSocialCat(cat)}
                    style={selectedSocialCat === cat ? styles.catBtnActive : styles.catBtn}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div style={styles.list}>
                {ICEBREAKERS[selectedSocialCat].map((item, idx) => (
                  <div key={idx} style={styles.icebreakerCard}>
                    <div style={{ fontSize: '12px', color: '#60A5FA', fontWeight: 'bold' }}>
                      סיטואציה: {item.situation}
                    </div>
                    <p style={{ margin: '8px 0', fontSize: '15px', fontWeight: 'bold' }}>{item.line}</p>
                    <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#9CA3AF' }}>
                      טיפ: {item.tip}
                    </p>
                    <button onClick={() => handleCopyLine(item.line, idx)} style={styles.copyBtn}>
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
    maxWidth: '1040px',
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
  abcWrapper: {
    backgroundColor: '#1F2937',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '20px',
    border: '1px solid #374151',
  },
  abcTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  addDayToggleBtn: {
    backgroundColor: '#111827',
    color: '#93C5FD',
    border: '1px solid #374151',
    padding: '8px 14px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  bigLettersRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    alignItems: 'stretch',
  },
  bigLetterCard: {
    position: 'relative',
    backgroundColor: '#111827',
    color: '#D1D5DB',
    border: '2px solid #374151',
    borderRadius: '16px',
    padding: '22px 14px 18px 14px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  bigLetterCardActive: {
    position: 'relative',
    background: 'linear-gradient(145deg, #1D4ED8, #1E3A8A)',
    color: '#FFFFFF',
    border: '2px solid #60A5FA',
    borderRadius: '18px',
    padding: '26px 16px 22px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    cursor: 'pointer',
    transform: 'scale(1.04)',
    boxShadow: '0 10px 25px rgba(37, 99, 235, 0.35)',
    transition: 'all 0.2s ease',
  },
  cardDeleteCornerBtn: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    backgroundColor: 'rgba(17, 24, 39, 0.65)',
    color: '#FCA5A5',
    border: '1px solid rgba(239, 68, 68, 0.35)',
    borderRadius: '6px',
    padding: '2px 7px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  headerEditForm: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  bigLetterText: {
    fontSize: '34px',
    fontWeight: 900,
    color: '#9CA3AF',
    lineHeight: 1,
  },
  bigLetterTextActive: {
    fontSize: '46px',
    fontWeight: 900,
    color: '#FFFFFF',
    lineHeight: 1,
  },
  addDayForm: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #374151',
  },
  todayWorkoutCard: {
    backgroundColor: '#1F2937',
    borderRadius: '16px',
    padding: '22px',
    marginBottom: '20px',
    border: '1px solid #3B82F6',
  },
  todayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '14px',
    marginBottom: '18px',
  },
  activeDayPill: {
    backgroundColor: '#2563EB',
    color: '#FFF',
    fontSize: '12px',
    fontWeight: 'bold',
    padding: '3px 10px',
    borderRadius: '999px',
  },
  editDayHeaderBtn: {
    backgroundColor: '#111827',
    color: '#93C5FD',
    border: '1px solid #374151',
    borderRadius: '8px',
    padding: '3px 10px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  scanBtn: {
    backgroundColor: '#7C3AED',
    color: '#FFFFFF',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  settingsIconBtn: {
    backgroundColor: '#111827',
    color: '#D1D5DB',
    border: '1px solid #374151',
    padding: '10px 12px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  apiConfigBox: {
    backgroundColor: '#111827',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #374151',
    marginBottom: '16px',
  },
  scanResultBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
    border: '1px solid #10B981',
    borderRadius: '12px',
    padding: '12px',
    marginBottom: '16px',
  },
  scanThumb: {
    width: '54px',
    height: '54px',
    borderRadius: '8px',
    objectFit: 'cover',
    border: '1px solid #374151',
  },
  exerciseCard: {
    padding: '14px 16px',
    borderRadius: '12px',
    border: '1px solid #374151',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '10px',
  },
  muscleBadge: {
    backgroundColor: '#1E293B',
    color: '#93C5FD',
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '6px',
    border: '1px solid #334155',
  },
  videoLinkBtn: {
    display: 'inline-block',
    backgroundColor: '#DC2626',
    color: '#FFFFFF',
    textDecoration: 'none',
    fontSize: '12px',
    fontWeight: 'bold',
    padding: '5px 10px',
    borderRadius: '6px',
  },
  editVideoBtn: {
    backgroundColor: 'transparent',
    color: '#9CA3AF',
    border: '1px solid #374151',
    fontSize: '11px',
    padding: '4px 8px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  addVideoInlineBtn: {
    backgroundColor: '#1E293B',
    color: '#93C5FD',
    border: '1px dashed #4B5563',
    fontSize: '12px',
    padding: '4px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  smallSaveBtn: {
    backgroundColor: '#10B981',
    color: '#064E3B',
    border: 'none',
    fontWeight: 'bold',
    fontSize: '12px',
    padding: '7px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  smallCancelBtn: {
    backgroundColor: '#374151',
    color: '#FFF',
    border: 'none',
    fontSize: '12px',
    padding: '7px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  presetChipsRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '16px',
  },
  presetChip: {
    backgroundColor: '#111827',
    color: '#D1D5DB',
    border: '1px solid #374151',
    padding: '7px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  presetChipActive: {
    backgroundColor: '#1E3A8A',
    color: '#FFFFFF',
    border: '1px solid #60A5FA',
    padding: '7px 12px',
    borderRadius: '8px',
    fontSize: '13px',
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
    marginBottom: '6px',
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
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
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
    marginBottom: '12px',
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