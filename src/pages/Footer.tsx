
// ...existing code...
//             rel="noopener noreferrer"
//             className="text-gray-400 hover:text-blue-300 transition"
//           >
//             <Linkedin className="h-5 w-5" />
//             <span className="sr-only">LinkedIn</span>
//           </a>
//           <a
//             href="mailto:careeranalytics499@gmail.com"
//             title="careeranalytics499@gmail.com"
//             className="text-gray-400 hover:text-blue-300 transition"
//           >
//             <Mail className="h-5 w-5" />
//             <span className="sr-only">Email</span>
//           </a>
//         </div>
//       </div>

//       {/* Column 2: Quick Links */}
//       <div className="space-y-4">
//         <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
//         <nav className="space-y-2">
//           <Link to="/" className="hover:text-blue-300 transition flex items-center space-x-2">
//             <Home className="h-4 w-4" /> <span>Home</span>
//           </Link>
//           <Link to="/all-challenges" className="hover:text-blue-300 transition flex items-center space-x-2">
//             <span>All Challenges</span>
//           </Link>
//           <Link to="/my-challenges" className="hover:text-blue-300 transition flex items-center space-x-2">
//             <span>My Challenges</span>
//           </Link>
//           <Link to="/dashboard" className="hover:text-blue-300 transition flex items-center space-x-2">
//             <ListChecks className="h-4 w-4" /> <span>Dashboard</span>
//           </Link>
//           <Link to="/leaderboard" className="hover:text-blue-300 transition flex items-center space-x-2">
//             <span>Leaderboard</span>
//           </Link>
//         </nav>
//       </div>

//       {/* Column 3: Legal */}
//       <div className="space-y-4">
//         <h3 className="text-lg font-semibold mb-2">Legal</h3>
//         <nav className="space-y-2">
//           <Link to="/privacy" className="hover:text-blue-300 transition flex items-center space-x-2">
//             <ShieldCheck className="h-4 w-4" /> <span>Privacy Policy</span>
//           </Link>
//           <Link to="/terms" className="hover:text-blue-300 transition flex items-center space-x-2">
//             <span>Terms of Use</span>
//           </Link>
//           <Link to="/refund" className="hover:text-blue-300 transition flex items-center space-x-2">
//             <span>Refund Policy</span>
//           </Link>
          
//         </nav>
//       </div>

//       {/* Column 4: Contact */}
//       <div className="space-y-4">
//         <h3 className="text-lg font-semibold mb-2">Contact</h3>
//         <nav className="space-y-2">
//           <Link to="/contact" className="hover:text-blue-300 transition flex items-center space-x-2">
//             <Mail className="h-4 w-4" /> <span>Contact Us</span>
//           </Link>
//         </nav>
//         <div className="mt-4">
//           <a
//             href="https://www.linkedin.com/company/analyticscareer/posts/?feedView=all"
//             target="_blank"
//             rel="noopener noreferrer"
//             className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md py-2 w-full flex justify-center items-center transition"
//           >
//             <Linkedin className="h-5 w-5 mr-2" />
//             Follow on LinkedIn
//           </a>
//         </div>
//       </div>
//     </div>

//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 border-t border-gray-800 py-4 text-center text-gray-400 text-sm">
//       © {new Date().getFullYear()} Analytics Career. All rights reserved.
//     </div>
//   </footer>
// );

// export default Footer;



import { Link } from 'react-router-dom';
import {
  Linkedin,
  Mail,
  Home,
  ListChecks,
  ShieldCheck,
  Trophy,
  UserCheck,
  BookOpen,
  FileText
} from 'lucide-react';

const Footer = () => (
  <footer className="bg-gray-900 text-white py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
      {/* Column 1: About Us */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <img
            src="https://d502jbuhuh9wk.cloudfront.net/logos/6677da88a7c70751b1bf34a8.png?v=1"
            alt="Logo"
            className="h-12 w-12 object-contain"
          />
          <span className="text-xl font-semibold">Analytics Career</span>
        </div>
        <p className="text-white-800 text-sm">
          Your go-to platform for mastering analytics interviews. Practice,
          learn, and land your dream job.
        </p>
        <div className="flex space-x-4 ">
          <a
            href="https://www.linkedin.com/company/analyticscareer/posts/?feedView=all"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white-800 hover:text-blue-300 transition"
          >
            <Linkedin className="h-5 w-5" />
            <span className="sr-only">LinkedIn</span>
          </a>
          <a
            href="mailto:careeranalytics499@gmail.com"
            title="careeranalytics499@gmail.com"
            className="text-white-800 hover:text-blue-300 transition"
          >
            <Mail className="h-5 w-5" />
            <span className="sr-only">Email</span>
          </a>
        </div>
      </div>

      {/* Column 2: Quick Links */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
        <nav className="space-y-2">
          <Link to="/" className="flex items-center space-x-2 text-white-800 hover:text-blue-300 transition">
            <Home className="h-4 w-4" /> <span>Home</span>
          </Link>
         
          <Link to="/dashboard" className="flex items-center space-x-2 text-white-800 hover:text-blue-300 transition">
            <ListChecks className="h-4 w-4" /> <span>Dashboard</span>
          </Link>
          
        </nav>
      </div>

      {/* Column 3: Legal */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-2">Legal</h3>
        <nav className="space-y-2">
          <Link to="/privacy" className="flex items-center space-x-2 text-white-800 hover:text-blue-300 transition">
            <ShieldCheck className="h-4 w-4" /> <span>Privacy Policy</span>
          </Link>
          <Link to="/terms" className="flex items-center space-x-2 text-white-800 hover:text-blue-300 transition">
            <FileText className="h-4 w-4" /> <span>Terms of Use</span>
          </Link>
          <Link to="/refund" className="flex items-center space-x-2 text-white-800 hover:text-blue-300 transition">
            <BookOpen className="h-4 w-4" /> <span>Refund Policy</span>
          </Link>
        </nav>
      </div>

      {/* Column 4: Contact */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-2">Contact</h3>
        <nav className="space-y-2">
          <Link to="/Contact" className="flex items-center space-x-2 text-white-800 hover:text-blue-300 transition">
            <Mail className="h-4 w-4" /> <span>Contact Us</span>
          </Link>
        </nav>
        <div className="mt-4">
          <a
            href="https://www.linkedin.com/company/analyticscareer/posts/?feedView=all"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md py-2 px-4 w-full inline-flex justify-center items-center transition"
          >
            <Linkedin className="h-5 w-5 mr-2" />
            Follow on LinkedIn
          </a>
        </div>
      </div>
    </div>

    {/* Bottom Bar */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 border-t border-gray-800 pt-4 text-center text-white-500 text-l">
      © {new Date().getFullYear()} Analytics Career. All rights reserved.
    </div>
  </footer>
);

export default Footer;
