const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  // نقاط الدخول
  entry: {
    main: './js/main.js',
    login: './js/pages/login.js',

    adminDashboard: './js/pages/admin/dashboard.js',
    adminCenters: './js/pages/admin/centers.js',
    adminCourses: './js/pages/admin/courses.js',
    adminUsers: './js/pages/admin/users.js',
  },
  
  output: {
    filename: '[name].bundle.js', 
    path: path.resolve(__dirname, 'dist'),
    clean: true, // ينظف مجلد dist قبل كل بناء جديد
    assetModuleFilename: 'images/[hash][ext][query]' // مكان حفظ الصور المعالجة
  },

  module: {
    rules: [
      // 1. قاعدة التعامل مع CSS
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      // 2. قاعدة التعامل مع الصور والخطوط داخل CSS
      {
        test: /\.(png|svg|jpg|jpeg|gif|woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },

  plugins: [
    // إعداد اسم ملف الـ CSS الناتج
    new MiniCssExtractPlugin({
      filename: "[name].css", // سينتج main.css, adminDashboard.css ...
    }),
  ],
  
  mode: 'production', // غيرناه للإنتاج لضغط الملفات تلقائياً
};