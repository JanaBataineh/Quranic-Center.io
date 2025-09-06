// بيانات المراكز القرآنية والدورات
const quranicCenters = [
  {
    id: '1',
    name: 'الصديق',
    description: 'مركز متخصص في تحفيظ القرآن الكريم وتعليم التجويد للجميع الأعمار',
    address: 'المغير',
    city: 'اربد',
    phone: '+966 79 501 7147',
    email: 'info@alnoor-center.com',
    website: 'www.alnoor-center.com',
    image: 'مركز الصديق.jpg',
    established: 1999,
    courses: [
      {
        id: '1-1',
        name: 'دورة تمهيدية في احكام التجويد',
        description: 'دورة شاملة لتحفيظ القرآن الكريم مع المراجعة المستمرة',
        duration: '12 شهر',
        level: 'مبتدئ',
        instructor: 'الشيخ أحمد محمد',
        schedule: 'يومياً من 8:00 ص - 10:00 ص',
        price: 20
      },
      {
        id: '1-2',
        name: 'دورة التجويد المتقدم',
        description: 'دورة متخصصة في أحكام التجويد والقراءات',
        duration: '6 شهور',
        level: 'متقدم',
        instructor: 'الشيخ عبد الرحمن السالم',
        schedule: 'السبت والثلاثاء 6:00 م - 8:00 م',
        price: 30
      },
      {
        id: '1-3',
        name: 'دورة متوسطة في احكام التجويد',
        description: 'دورة مخصصة لتعليم الأطفال القرآن الكريم بطرق تفاعلية',
        duration: '9 شهور',
        level: 'مبتدئ',
        instructor: 'الأستاذة فاطمة أحمد',
        schedule: 'يومياً من 4:00 م - 6:00 م',
        price: 15
      }
    ]
  },
  {
    id: '2',
    name: 'ابن تيمية',
    description: 'معهد متميز في تعليم القرآن الكريم والعلوم الشرعية',
    address: 'الشمالي',
    city: 'اربد',
    phone: '+962 79 505 6624',
    email: 'contact@furqan-institute.org',
    image: 'مركز ابن تيمية.jpeg',
    established: 1997,
    courses: [
      {
        id: '2-1',
        name: 'إجازة في القراءات العشر',
        description: 'برنامج متكامل للحصول على إجازة في القراءات العشر',
        duration: '24 شهر',
        level: 'متقدم',
        instructor: 'الشيخ محمد الغامدي',
        schedule: 'يومياً من 9:00 ص - 12:00 ظ',
        price: 45
      },
      {
        id: '2-2',
        name: 'دورة التفسير والتدبر',
        description: 'دورة في تفسير القرآن الكريم وتدبر معانيه',
        duration: '8 شهور',
        level: 'متوسط',
        instructor: 'الدكتور عبد الله الحربي',
        schedule: 'الأحد والأربعاء 7:00 م - 9:00 م',
        price: 30
      }
    ]
  },
  {
    id: '3',
    name: 'علي بن ابي طالب',
    description: 'جمعية خيرية تعمل على نشر تعليم القرآن الكريم في المجتمع',
    address: 'الحي الشرقي',
    city: 'اربد',
    phone: '+962 79 040 5427',
    email: 'info@quran-society.org',
    image: 'مركز علي بن ابي طالب.jpeg',
    established: 2002,
    courses: [
      {
        id: '3-1',
        name: 'حفظ جزء عم',
        description: 'برنامج خاص لحفظ جزء عم للمبتدئين',
        duration: '4 شهور',
        level: 'مبتدئ',
        instructor: 'الأستاذ خالد المطيري',
        schedule: 'يومياً من 5:00 م - 7:00 م',
        price: 15
      },
      {
        id: '3-2',
        name: 'دورة الإقراء والتجويد',
        description: 'دورة تدريبية لإعداد المقرئين والمعلمين',
        duration: '10 شهور',
        level: 'متوسط',
        instructor: 'الشيخ سعد القحطاني',
        schedule: 'السبت والاثنين والأربعاء 8:00 م - 10:00 م',
        price: 15
      }
    ]
  },
  {
    id: '4',
    name: 'مركز ابي بن كعب',
    description: 'مركز حديث يستخدم أحدث الوسائل التقنية في تعليم القرآن',
    address: 'مخيم البقعة',
    city: 'البلقاء',
    phone: '+966 11 789 0123',
    email: 'admin@albayan-center.sa',
    website: 'www.albayan-center.sa',
    image: 'مركز ابي بن كعب.jpeg',
    established: 2003,
    courses: [
      {
        id: '4-1',
        name: 'القرآن الرقمي للمبتدئين',
        description: 'تعلم القرآن باستخدام التطبيقات والوسائل الذكية',
        duration: '6 شهور',
        level: 'مبتدئ',
        instructor: 'الأستاذ عمر الزهراني',
        schedule: 'الأحد والثلاثاء والخميس 7:00 م - 9:00 م',
        price: 45
      },
      {
        id: '4-2',
        name: 'دورة الخط العثماني',
        description: 'تعلم كتابة القرآن الكريم بالخط العثماني',
        duration: '5 شهور',
        level: 'متوسط',
        instructor: 'الأستاذ محمد الشريف',
        schedule: 'السبت والاثنين 6:00 م - 8:00 م',
        price: 30
      }
    ]
  }
];

// إحصائيات عامة
const getStatistics = () => {
  const totalCenters = quranicCenters.length;
  const totalCourses = quranicCenters.reduce((sum, center) => sum + center.courses.length, 0);
  const cities = [...new Set(quranicCenters.map(center => center.city))];
  const totalCities = cities.length;
  const averageRating = quranicCenters.reduce((sum, center) => sum + center.rating, 0) / totalCenters;
  
  return {
    totalCenters,
    totalCourses,
    totalCities,
    averageRating: Math.round(averageRating * 10) / 10,
    cities: cities.sort()
  };
};

// الحصول على جميع الدورات مع معلومات المراكز
const getAllCourses = () => {
  return quranicCenters.flatMap(center =>
    center.courses.map(course => ({
      ...course,
      centerName: center.name,
      centerCity: center.city,
      centerRating: center.rating,
      centerId: center.id
    }))
  );
};