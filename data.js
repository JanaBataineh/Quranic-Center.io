// بيانات المراكز القرآنية والدورات
const quranicCenters = [
  {
    id: '1',
    name: 'مركز النور لتحفيظ القرآن الكريم',
    description: 'مركز متخصص في تحفيظ القرآن الكريم وتعليم التجويد للجميع الأعمار',
    address: 'شارع الملك فهد، حي النزهة',
    city: 'الرياض',
    phone: '+966 11 123 4567',
    email: 'info@alnoor-center.com',
    website: 'www.alnoor-center.com',
    image: 'https://images.unsplash.com/photo-1584286595398-a59511e0649f?w=500&h=300&fit=crop',
    rating: 4.8,
    established: 2010,
    courses: [
      {
        id: '1-1',
        name: 'دورة تحفيظ القرآن الكريم',
        description: 'دورة شاملة لتحفيظ القرآن الكريم مع المراجعة المستمرة',
        duration: '12 شهر',
        level: 'مبتدئ',
        instructor: 'الشيخ أحمد محمد',
        schedule: 'يومياً من 8:00 ص - 10:00 ص',
        price: 500
      },
      {
        id: '1-2',
        name: 'دورة التجويد المتقدم',
        description: 'دورة متخصصة في أحكام التجويد والقراءات',
        duration: '6 شهور',
        level: 'متقدم',
        instructor: 'الشيخ عبد الرحمن السالم',
        schedule: 'السبت والثلاثاء 6:00 م - 8:00 م',
        price: 800
      },
      {
        id: '1-3',
        name: 'دورة القرآن للأطفال',
        description: 'دورة مخصصة لتعليم الأطفال القرآن الكريم بطرق تفاعلية',
        duration: '9 شهور',
        level: 'مبتدئ',
        instructor: 'الأستاذة فاطمة أحمد',
        schedule: 'يومياً من 4:00 م - 6:00 م',
        price: 400
      }
    ]
  },
  {
    id: '2',
    name: 'معهد الفرقان للقرآن الكريم',
    description: 'معهد متميز في تعليم القرآن الكريم والعلوم الشرعية',
    address: 'طريق الملك عبد العزيز، حي الصفا',
    city: 'جدة',
    phone: '+966 12 987 6543',
    email: 'contact@furqan-institute.org',
    image: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=500&h=300&fit=crop',
    rating: 4.9,
    established: 2005,
    courses: [
      {
        id: '2-1',
        name: 'إجازة في القراءات العشر',
        description: 'برنامج متكامل للحصول على إجازة في القراءات العشر',
        duration: '24 شهر',
        level: 'متقدم',
        instructor: 'الشيخ محمد الغامدي',
        schedule: 'يومياً من 9:00 ص - 12:00 ظ',
        price: 2000
      },
      {
        id: '2-2',
        name: 'دورة التفسير والتدبر',
        description: 'دورة في تفسير القرآن الكريم وتدبر معانيه',
        duration: '8 شهور',
        level: 'متوسط',
        instructor: 'الدكتور عبد الله الحربي',
        schedule: 'الأحد والأربعاء 7:00 م - 9:00 م',
        price: 600
      }
    ]
  },
  {
    id: '3',
    name: 'جمعية تحفيظ القرآن الكريم',
    description: 'جمعية خيرية تعمل على نشر تعليم القرآن الكريم في المجتمع',
    address: 'شارع الأمير سلطان، حي العليا',
    city: 'الدمام',
    phone: '+966 13 456 7890',
    email: 'info@quran-society.org',
    image: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=500&h=300&fit=crop',
    rating: 4.7,
    established: 1998,
    courses: [
      {
        id: '3-1',
        name: 'حفظ جزء عم',
        description: 'برنامج خاص لحفظ جزء عم للمبتدئين',
        duration: '4 شهور',
        level: 'مبتدئ',
        instructor: 'الأستاذ خالد المطيري',
        schedule: 'يومياً من 5:00 م - 7:00 م',
        price: 300
      },
      {
        id: '3-2',
        name: 'دورة الإقراء والتجويد',
        description: 'دورة تدريبية لإعداد المقرئين والمعلمين',
        duration: '10 شهور',
        level: 'متوسط',
        instructor: 'الشيخ سعد القحطاني',
        schedule: 'السبت والاثنين والأربعاء 8:00 م - 10:00 م',
        price: 900
      }
    ]
  },
  {
    id: '4',
    name: 'مركز البيان لتعليم القرآن',
    description: 'مركز حديث يستخدم أحدث الوسائل التقنية في تعليم القرآن',
    address: 'حي الملقا، شارع التخصصي',
    city: 'الرياض',
    phone: '+966 11 789 0123',
    email: 'admin@albayan-center.sa',
    website: 'www.albayan-center.sa',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=300&fit=crop',
    rating: 4.6,
    established: 2015,
    courses: [
      {
        id: '4-1',
        name: 'القرآن الرقمي للمبتدئين',
        description: 'تعلم القرآن باستخدام التطبيقات والوسائل الذكية',
        duration: '6 شهور',
        level: 'مبتدئ',
        instructor: 'الأستاذ عمر الزهراني',
        schedule: 'الأحد والثلاثاء والخميس 7:00 م - 9:00 م',
        price: 550
      },
      {
        id: '4-2',
        name: 'دورة الخط العثماني',
        description: 'تعلم كتابة القرآن الكريم بالخط العثماني',
        duration: '5 شهور',
        level: 'متوسط',
        instructor: 'الأستاذ محمد الشريف',
        schedule: 'السبت والاثنين 6:00 م - 8:00 م',
        price: 700
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