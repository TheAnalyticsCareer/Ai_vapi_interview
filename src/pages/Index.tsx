import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Briefcase,
    Mic,
    Camera,
    Brain,
    Star,
    CheckCircle,
    ArrowRight,
    Users,
    Award,
    TrendingUp,
    Crown
} from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { QRCodeSVG } from "qrcode.react";
import { Dialog as HeadlessDialog } from "@headlessui/react";
import emailjs from 'emailjs-com';
// import Footer from "@/pages/Footer";
import PaymentFormModal from "@/components/PaymentFormModal";

// Constants for names and content
const HERO_TITLE_PART1 = "Master Your";
const HERO_TITLE_PART2 = " Interview Skills";
const HERO_DESCRIPTION = "Practice with our AI-powered interview coach. Get real-time feedback, improve your responses, and land your dream job with confidence.";
const FREE_TO_START_MESSAGE = "Free to start • No credit card required";

const FEATURES_CONTENT = [
    {
        icon: <Brain className="h-8 w-8 text-blue-600" />,
        title: "AI-Powered Interviews",
        description: "Practice with advanced AI that asks real interview questions"
    },
    {
        icon: <Mic className="h-8 w-8 text-green-600" />,
        title: "Voice Interaction",
        description: "Natural conversation with real-time voice recognition"
    },
    {
        icon: <Camera className="h-8 w-8 text-purple-600" />,
        title: "Video Interview Simulation",
        description: "Experience realistic video interview environment"
    },
    {
        icon: <TrendingUp className="h-8 w-8 text-orange-600" />,
        title: "Detailed Feedback",
        description: "Get comprehensive analysis and improvement suggestions"
    }
];

const BENEFITS_CONTENT = [
    "Realistic interview simulation",
    "Instant AI-generated feedback",
    "Multiple role templates",
    "Progress tracking",
    "Voice and video practice",
    "24/7 availability"
];

const PRICING_PLANS = [
    {
        name: "Free",
        price: "$0",
        frequency: "Forever",
        features: [
            "✅ 3 AI interview sessions",
            "✅ Basic feedback reports",
            "✅ Voice interaction",
            "✅ Video interview simulation",
            "✅ Progress tracking",
        ],
        buttonText: "Get Started Free",
        buttonOnClick: (navigate: any) => navigate('/login'),
        highlighted: false,
        borderColor: "border-blue-300",
        buttonBgColor: "bg-blue-600 hover:bg-blue-700",
        textColor: "text-blue-700"
    },
    {
        name: "Monthly",
        price: "$9",
        frequency: "Per Month",
        features: [
            "✅ Unlimited AI interviews",
            "✅ Advanced feedback & analytics",
            "✅ Multiple role templates",
            "✅ Priority voice processing",
            "✅ Custom interview scenarios",
            "✅ Email support",
        ],
        buttonText: "Start Monthly Plan",
        buttonOnClick: (navigate: any, handlePricingClick: (plan: string) => void) => handlePricingClick("Monthly"),
        highlighted: true,
        borderColor: "border-purple-500",
        buttonBgColor: "bg-purple-600 hover:bg-purple-700",
        textColor: "text-purple-700"
    },
    {
        name: "Yearly",
        price: "$99",
        frequency: "Per Year",
        features: [
            "✅ Everything in Monthly",
            "✅ <span className=\"text-green-600 font-medium\">Save $29 per year</span>",
            "✅ Premium interview scenarios",
            "✅ Detailed performance analytics",
            "✅ Priority customer support",
            "✅ 1-on-1 coaching session",
        ],
        buttonText: "Choose Yearly",
        buttonOnClick: (navigate: any, handlePricingClick: (plan: string) => void) => handlePricingClick("Yearly"),
        highlighted: false,
        borderColor: "border-blue-300",
        buttonBgColor: "bg-blue-600 hover:bg-blue-700",
        textColor: "text-blue-700"
    },{
        name: "Academia/ Enterprises",
        price: "",
        frequency: "Customized for You",
        features: [
            "✅ Focus on Foundational Interview Skills",
            "✅ Limited Resume & Cover Letter Feedback",
            "✅ Short & Focused Practice Sessions",
            "✅ Basic Performance Analytics",
            "✅ Access to Student Role Templates",
        ],
        buttonText: "Contact Us",
        buttonOnClick: (navigate: any, handlePricingClick: (plan: string) => void) => handlePricingClick("Student"),
        highlighted: false,
        borderColor: "border-yellow-300",
        buttonBgColor: "bg-yellow-600 hover:bg-yellow-700",
        textColor: "text-yellow-700"
    },
];

const TESTIMONIALS_CONTENT = [
    {
        name: "Isabella Thompson",
        image: "https://randomuser.me/api/portraits/women/46.jpg",
        review: "The AI agent felt so human-like. It pushed me with challenging follow-ups and helped me improve my thinking on the spot.",
    },
    {
        name: "Mason Lee",
        image: "https://randomuser.me/api/portraits/men/47.jpg",
        review: "The instant transcript feature helped me analyze exactly what I said and where I hesitated. Great for self-evaluation.",
    },
    {
        name: "Ava Johnson",
        image: "https://randomuser.me/api/portraits/women/48.jpg",
        review: "The feedback wasn't generic—it was specific to my answers, tone, and confidence. That made all the difference!",
    },
    {
        name: "Logan White",
        image: "https://randomuser.me/api/portraits/men/49.jpg",
        review: "As someone switching careers, this platform helped me practice domain-specific interviews and build relevant confidence.",
    },
    {
        name: "Mia Hernandez",
        image: "https://randomuser.me/api/portraits/women/50.jpg",
        review: "I loved how the platform broke down my performance into clarity, fluency, and confidence scores. Super helpful!",
    },
    {
        name: "Lucas Hall",
        image: "https://randomuser.me/api/portraits/men/51.jpg",
        review: "Practicing under pressure with timed questions helped me manage stress during real interviews.",
    },
    {
        name: "Ella Young",
        image: "https://randomuser.me/api/portraits/women/52.jpg",
        review: "I practiced for FAANG-level system design interviews with this tool, and the AI adapted the questions beautifully.",
    },
    {
        name: "Henry King",
        image: "https://randomuser.me/api/portraits/men/53.jpg",
        review: "It's like having a personal coach 24/7. I practiced daily and noticed a massive boost in my articulation.",
    },
    {
        name: "Grace Lopez",
        image: "https://randomuser.me/api/portraits/women/54.jpg",
        review: "From HR rounds to technical deep-dives, this platform helped me cover every interview format.",
    },
    {
        name: "Sebastian Rivera",
        image: "https://randomuser.me/api/portraits/men/55.jpg",
        review: "The mock interviews were so close to real interviews that I didn't panic during the actual one!",
    }
];

const HOW_IT_WORKS_CONTENT = [
    {
        title: "Choose Your Role",
        description: "Select from a variety of popular job roles or customize your own interview scenario.",
        icon: <Briefcase className="h-12 w-12 text-purple-500 mb-4" />,
    },
    {
        title: "Practice with AI",
        description: "Our advanced AI will ask you relevant interview questions based on your chosen role.",
        icon: <Brain className="h-12 w-12 text-blue-500 mb-4" />,
    },
    {
        title: "Get Instant Feedback",
        description: "Receive immediate analysis on your responses, including areas for improvement.",
        icon: <Award className="h-12 w-12 text-green-500 mb-4" />,
    },
    {
        title: "Improve and Succeed",
        description: "Refine your skills with each practice session and gain the confidence to ace your real interviews.",
        icon: <TrendingUp className="h-12 w-12 text-orange-500 mb-4" />,
    },
];

const Index = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [email, setEmail] = useState('');
    const [open, setOpen] = useState(false);
    const [adminOpen, setAdminOpen] = useState(false);
    const [adminLoggedIn, setAdminLoggedIn] = useState(false);
    const [adminPass, setAdminPass] = useState('');
    const [interviews, setInterviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [upiModalOpen, setUpiModalOpen] = useState(false);
    const [showTxnInput, setShowTxnInput] = useState(false);
    const [txnId, setTxnId] = useState('');
    const [sending, setSending] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string>("Free");

    // Your UPI details
    const upiId = "";
    const payeeName = "Analytics Career";
    const amount = 1;
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR`;

    useEffect(() => {
        if (window.location.hash === '#pricing') {
            const el = document.getElementById('pricing');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    const handleAdminLogin = async () => {
        setLoading(true);
        if (adminPass === 'admin123') {
            if (!user) {
                alert('Please sign in as admin to view data.');
                setLoading(false);
                return;
            }
            setAdminLoggedIn(true);
            const snap = await getDocs(collection(db, 'interviews'));
            setInterviews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } else {
            alert('Incorrect password');
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleMonthlyPayment = () => {
        setSelectedPlan("Monthly");
        setUpiModalOpen(true);
    };

    const handlePricingClick = (plan: string) => {
        setSelectedPlan(plan);
        setPaymentModalOpen(true);
    };

    const handlePaymentSubmit = async (form: any) => {
        setPaymentLoading(true);
        try {
            // Map "Student" to "Academia/ Enterprises"
            let plan = form.plan;
            if (plan === "Student") {
                plan = "Academia/ Enterprises";
            }

            // Prepare data without txnId and experience
            const { txnId, experience, ...rest } = form;
            await addDoc(collection(db, "payments_form"), {
  ...rest,
  plan,
  createdAt: Timestamp.now(),
});
            alert("Registration submitted! We'll verify your payment soon.");
        } catch (error) {
            alert("Failed to submit registration. Please try again.");
        } finally {
            setPaymentLoading(false);
            setPaymentModalOpen(false);
        }
    };

    const sendTxnEmail = async () => {
        setSending(true);
        try {
            await emailjs.send(
                'service_qlhd5tc',
                'template_2mbdyvr',
                {
                    to_email: '',
                    transaction_id: txnId,
                },
                'B9S3vjE_6ujpIEkI1'
            );
            alert('Transaction ID sent successfully!');
            setShowTxnInput(false);
            setTxnId('');
            setUpiModalOpen(false);
        } catch (err) {
            alert('Failed to send email. Please try again.');
        }
        setSending(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 font-sans">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center space-x-3">
                            <img
                                src="https://d502jbuhuh9wk.cloudfront.net/logos/6677da88a7c70751b1bf34a8.png?v=1"
                                alt="Logo"
                                className="h-10 w-10 object-contain"
                            />
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">AI Interviewer</h1>
                        </div>

                        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
                            {user ? (
                                <>
                                    <Button
                                        onClick={() => navigate('/dashboard')}
                                        className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
                                        size="sm"
                                    >
                                        Dashboard
                                    </Button>
                                    <Button
                                        onClick={handleLogout}
                                        variant="outline"
                                        className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-sm sm:text-base"
                                        size="sm"
                                    >
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button 
                                        onClick={() => navigate('/login')} 
                                        variant="ghost"
                                        size="sm"
                                        className="text-sm sm:text-base"
                                    >
                                        Sign In
                                    </Button>
                                    <Button
                                        onClick={() => navigate('/signup')}
                                        className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
                                        size="sm"
                                    >
                                        Get Started
                                    </Button>
                                </>
                            )}
                            <Button
                                variant="ghost"
                                className="rounded-full border border-yellow-400 text-yellow-700 hover:bg-yellow-50 text-sm sm:text-base"
                                onClick={() => setAdminOpen(true)}
                                title="Admin Login"
                                size="sm"
                            >
                                <Crown className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                                <span className="font-semibold">Admin</span>
                            </Button>
                        </div>
                    </div>
                </div>
                
            </header>
            {/* Hero Section */}
            <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-100 to-purple-100">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
                        {HERO_TITLE_PART1}
                        <span className="text-blue-600">{HERO_TITLE_PART2}</span>
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto">
                        {HERO_DESCRIPTION}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12">
                        <Button
                            onClick={() => navigate(user ? '/dashboard' : '/signup')}
                            size="lg"
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-sm sm:text-base px-6 py-3 rounded-full"
                        >
                            Start Practicing Now
                            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                        <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-600">
                            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-current" />
                            <span>{FREE_TO_START_MESSAGE}</span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 mt-8 sm:mt-12 px-4">
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 mb-1 sm:mb-2">10K+</div>
                            <div className="text-xs sm:text-sm text-gray-600">Interviews Practiced</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600 mb-1 sm:mb-2">95%</div>
                            <div className="text-xs sm:text-sm text-gray-600">Success Rate</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600 mb-1 sm:mb-2">50+</div>
                            <div className="text-xs sm:text-sm text-gray-600">Job Roles</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-12 sm:py-16 lg:py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 sm:mb-16">
                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                            How It Works
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                            Get started in three easy steps
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        {HOW_IT_WORKS_CONTENT.map((step, index) => (
                            <div key={index} className="text-center px-4">
                                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4">{step.icon}</div>
                                <h4 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-2">
                                    {step.title}
                                </h4>
                                <p className="text-gray-600 text-xs sm:text-sm md:text-base">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-12 sm:py-16 lg:py-20 bg-gray-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 sm:mb-16">
                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                            Key Features
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                            Explore the powerful features designed to boost your interview skills
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {FEATURES_CONTENT.map((feature, index) => (
                            <Card
                                key={index}
                                className="text-center hover:shadow-lg transition-shadow duration-200"
                            >
                                <CardHeader>
                                    <div className="mx-auto mb-2 sm:mb-4">{feature.icon}</div>
                                    <CardTitle className="text-base sm:text-lg md:text-xl font-semibold">
                                        {feature.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-12 sm:py-16 lg:py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
                        <div>
                            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                                Unlock Your Potential with AI Interview Practice
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                                Our comprehensive platform provides all the tools and insights
                                you need to excel in any interview situation.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                {BENEFITS_CONTENT.map((benefit, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                                        <span className="text-xs sm:text-sm text-gray-700">{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                            <Card className="p-4 sm:p-6 shadow-md">
                                <div className="flex items-center space-x-3 sm:space-x-4">
                                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                                    <div>
                                        <h4 className="text-sm sm:text-base font-semibold text-gray-900">Multiple Interview Types</h4>
                                        <p className="text-xs sm:text-sm text-gray-600">Technical, behavioral, and case study interviews</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4 sm:p-6 shadow-md">
                                <div className="flex items-center space-x-3 sm:space-x-4">
                                    <Award className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                                    <div>
                                        <h4 className="text-sm sm:text-base font-semibold text-gray-900">Personalized Feedback</h4>
                                        <p className="text-xs sm:text-sm text-gray-600">AI-powered analysis of your performance</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4 sm:p-6 shadow-md">
                                <div className="flex items-center space-x-3 sm:space-x-4">
                                    <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                                    <div>
                                        <h4 className="text-sm sm:text-base font-semibold text-gray-900">Progress Tracking</h4>
                                        <p className="text-xs sm:text-sm text-gray-600">Monitor your improvement over time</p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
                
            </section>
            {/* Pricing Section */}
            <section id="pricing" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-50 to-purple-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center mb-6 sm:mb-8 bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
                        Choose Your Plan
                    </h2>
                    <p className="text-center text-gray-600 mb-8 sm:mb-12 text-sm sm:text-base">
                        Start for free, or upgrade for unlimited AI interview practice
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        {PRICING_PLANS.map((plan, index) => (
                            <div
                                key={index}
                                className={`rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border relative hover:shadow-xl transition-all duration-300 ${plan.borderColor} ${plan.highlighted ? 'border-2 sm:border-4 scale-[1.02] sm:scale-105' : ''}`}
                            >
                                {plan.highlighted && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow">
                                        Most Popular
                                    </span>
                                )}
                                <h3 className={`text-xl sm:text-2xl font-semibold mb-2 text-left ${plan.textColor}`}>{plan.name}</h3>
                                <div className="text-3xl sm:text-4xl font-bold mb-1 text-left">{plan.price}</div>
                                <div className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 text-left">{plan.frequency}</div>
                                <ul className="text-gray-700 mb-6 sm:mb-8 space-y-1 sm:space-y-2 text-xs sm:text-sm text-left leading-relaxed">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} dangerouslySetInnerHTML={{ __html: feature }} />
                                    ))}
                                </ul>
                                <Button
                                    className={`w-full py-2 sm:py-3 px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition ${plan.buttonBgColor}`}
                                    onClick={() => {
                                        if (plan.name === "Free") {
                                            navigate('/login');
                                        } else if (plan.buttonOnClick.length === 2) {
                                            plan.buttonOnClick(navigate, handlePricingClick);
                                        } else {
                                            plan.buttonOnClick(navigate);
                                        }
                                    }}
                                >
                                    {plan.buttonText}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action Section
            <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-purple-100 to-blue-200">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">Ready to Ace Your Next Interview?</h2>
                    <p className="text-sm sm:text-base text-gray-600 mb-8 sm:mb-10">
                        Join thousands of successful candidates who have used our AI Interview Coach to prepare and land their dream jobs.
                    </p>
                    <Button
                        onClick={() => navigate('/signup')}
                        size="lg"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm sm:text-base px-8 sm:px-10 py-3 sm:py-4 rounded-full shadow-md"
                    >
                        Start Your Free Trial Today
                        <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                </div>
            </section> */}

            {/* Rating & Reviews Section */}
            <section className="py-12 sm:py-16 lg:py-20 bg-gray-100 overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-10">What Our Users Say</h2>
                    <div className="relative">
                        <div className="overflow-hidden">
                            <div className="flex space-x-4 sm:space-x-6 animate-marquee w-max">
                                {TESTIMONIALS_CONTENT.map((testimonial, idx) => (
                                    <div
                                        key={idx}
                                        className="min-w-[260px] sm:min-w-[280px] max-w-sm bg-white border border-gray-200 rounded-xl shadow-md p-4 sm:p-6 flex-shrink-0"
                                    >
                                        <div className="flex items-center mb-3 sm:mb-4">
                                            <img className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover mr-2 sm:mr-3" src={testimonial.image} alt={testimonial.name} />
                                            <div>
                                                <p className="text-xs sm:text-sm font-semibold text-gray-800">{testimonial.name}</p>
                                                <p className="text-2xs sm:text-xs text-gray-500">Verified User</p>
                                            </div>
                                        </div>
                                        <p className="text-gray-700 text-xs sm:text-sm mb-3 sm:mb-4">"{testimonial.review}"</p>
                                        <div className="flex">
                                            {[...Array(5)].map((_, starIdx) => (
                                                <svg
                                                    key={starIdx}
                                                    className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.975a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.39 2.46a1 1 0 00-.364 1.118l1.286 3.974c.3.922-.755 1.688-1.538 1.118l-3.39-2.46a1 1 0 00-1.176 0l-3.39 2.46c-.783.57-1.838-.196-1.538-1.118l1.286-3.974a1 1 0 00-.364-1.118L2.045 9.402c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.975z" />
                                                </svg>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* <Footer /> now rendered globally in App.tsx */}

            {/* Admin Dialog */}
            <Dialog open={adminOpen} onOpenChange={setAdminOpen}>
                <DialogTrigger asChild></DialogTrigger>
                <DialogContent className="max-w-full md:max-w-7xl overflow-x-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Crown className="h-6 w-6 text-yellow-600" /> Admin Panel
                        </DialogTitle>
                        <DialogDescription>Login to view all interview records.</DialogDescription>
                    </DialogHeader>
                    {!adminLoggedIn ? (
                        <div className="space-y-4">
                            <Input
                                type="password"
                                placeholder="Enter admin password"
                                value={adminPass}
                                onChange={e => setAdminPass(e.target.value)}
                                className="w-full"
                            />
                            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" onClick={handleAdminLogin} disabled={loading}>
                                {loading ? 'Logging in...' : 'Login as Admin'}
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <h3 className="font-semibold mb-4 text-lg">All Interview Records</h3>
                            <div className="max-h-[60vh] overflow-auto rounded-lg border border-gray-200 bg-white shadow">
                                <table className="min-w-full text-xs sm:text-sm">
                                    <thead className="sticky top-0 bg-gray-100 z-10">
                                        <tr>
                                            <th className="p-2 sm:p-3 text-left font-semibold">Candidate</th>
                                            <th className="p-2 sm:p-3 text-left font-semibold">Role</th>
                                            <th className="p-2 sm:p-3 text-left font-semibold">Status</th>
                                            <th className="p-2 sm:p-3 text-left font-semibold">Score</th>
                                            <th className="p-2 sm:p-3 text-left font-semibold">Date</th>
                                            <th className="p-2 sm:p-3 text-left font-semibold w-48 sm:w-72">Transcript</th>
                                            <th className="p-2 sm:p-3 text-left font-semibold w-48 sm:w-72">Feedback</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {interviews.map((i) => (
                                            <tr key={i.id} className="border-b hover:bg-gray-50">
                                                <td className="p-2 sm:p-3">{i.candidateName}</td>
                                                <td className="p-2 sm:p-3">{i.role}</td>
                                                <td className="p-2 sm:p-3">{i.status}</td>
                                                <td className="p-2 sm:p-3">{i.score ?? '-'}</td>
                                                <td className="p-2 sm:p-3">{i.createdAt ? new Date(i.createdAt).toLocaleString() : '-'}</td>
                                                <td className="p-2 sm:p-3 align-top">
                                                    <div className="bg-gray-100 border border-gray-300 rounded p-2 max-h-32 overflow-y-auto text-xs font-mono w-48 sm:w-72">
                                                        {typeof i.transcript === 'string' ? i.transcript : Array.isArray(i.transcript) ? i.transcript.join('\n') : '-'}
                                                    </div>
                                                </td>
                                                <td className="p-2 sm:p-3 align-top">
                                                    <div className="bg-gray-100 border border-gray-300 rounded p-2 max-h-32 overflow-y-auto text-xs font-mono w-48 sm:w-72">
                                                        {typeof i.feedback === 'object' && !Array.isArray(i.feedback) ? (
                                                            <div className="space-y-1">
                                                                {Object.entries(i.feedback).map(([key, value]) => (
                                                                    <div key={key}><span className="font-semibold">{key}:</span> {value}</div>
                                                                ))}
                                                            </div>
                                                        ) : typeof i.feedback === 'string' ? i.feedback : Array.isArray(i.feedback) ? i.feedback.join('\n') : '-'}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {interviews.length === 0 && <div className="text-gray-500 text-center py-8">No interviews found.</div>}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

           

            {/* Payment Form Modal */}
            <PaymentFormModal open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} upiUrl={upiUrl} onSubmit={handlePaymentSubmit} loading={paymentLoading} defaultPlan={selectedPlan} />
        </div>
    );
};

export default Index;
