/**
 * Lightweight icon components using CSS/unicode instead of inline SVG
 * This significantly reduces HTML size and improves text-to-HTML ratio for SEO
 * Each lucide icon adds ~500 bytes of SVG, these use ~10 bytes
 */

import React from 'react';

interface IconProps {
  className?: string;
}

// Status icons
export const CheckIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={`text-green-500 ${className}`} aria-hidden="true">✓</span>
);

export const XIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={`text-red-500 ${className}`} aria-hidden="true">✕</span>
);

export const AlertIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={`text-yellow-500 ${className}`} aria-hidden="true">⚠</span>
);

export const InfoIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={`text-blue-500 ${className}`} aria-hidden="true">ⓘ</span>
);

// Star ratings
export const StarFilledIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={`text-yellow-400 ${className}`} aria-hidden="true">★</span>
);

export const StarEmptyIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={`text-gray-300 ${className}`} aria-hidden="true">☆</span>
);

// Navigation arrows
export const ArrowRightIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">→</span>
);

export const ArrowLeftIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">←</span>
);

export const ChevronRightIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">›</span>
);

export const ExternalLinkIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">↗</span>
);

// Category icons (emoji-based)
export const TrendingUpIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">📈</span>
);

export const TrendingDownIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">📉</span>
);

export const GlobeIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🌍</span>
);

export const ShieldIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🛡</span>
);

export const UsersIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">👥</span>
);

export const AwardIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🏆</span>
);

export const SmartphoneIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">📱</span>
);

export const CalculatorIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🧮</span>
);

export const BookIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">📖</span>
);

export const BankIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🏦</span>
);

export const MailIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">✉</span>
);

export const MenuIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">☰</span>
);

export const SearchIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🔍</span>
);

export const LoaderIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={`animate-spin ${className}`} aria-hidden="true">⏳</span>
);

// Additional icons for broker pages
export const CrownIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">👑</span>
);

export const PieChartIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">📊</span>
);

export const BuildingIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🏢</span>
);

export const FlagIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🚩</span>
);

export const ZapIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">⚡</span>
);

export const TargetIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🎯</span>
);

export const ClockIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🕐</span>
);

export const WalletIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">💰</span>
);

export const ChartIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">📈</span>
);

export const LockIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🔒</span>
);

export const HomeIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🏠</span>
);

export const LayersIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">📚</span>
);

export const FilterIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🔽</span>
);

export const RefreshIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🔄</span>
);

export const DownloadIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">⬇</span>
);

export const CopyIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">📋</span>
);

export const TrashIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🗑</span>
);

export const PlusIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">+</span>
);

export const MinusIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">−</span>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">▼</span>
);

export const ChevronUpIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">▲</span>
);

export const ChevronLeftIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">‹</span>
);

export const MoreHorizontalIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">⋯</span>
);

export const GripVerticalIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">⋮</span>
);

export const PanelLeftIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">⬅</span>
);

export const CloseIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">×</span>
);

export const DollarIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">$</span>
);

export const PercentIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">%</span>
);

export const CalendarIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">📅</span>
);

export const PlayIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">▶</span>
);

export const PauseIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">⏸</span>
);

export const SettingsIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">⚙</span>
);

export const HelpIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">❓</span>
);

export const LightbulbIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">💡</span>
);

export const FireIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🔥</span>
);

export const LeafIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🌿</span>
);

export const RocketIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🚀</span>
);

export const HeartIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">❤</span>
);

export const EyeIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">👁</span>
);

export const EyeOffIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🙈</span>
);

export const LinkIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🔗</span>
);

export const CreditCardIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">💳</span>
);

export const FileTextIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">📄</span>
);

// Additional icons for ETF pages
export const BrainIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🧠</span>
);

export const BotIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🤖</span>
);

export const CpuIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">💻</span>
);

export const ActivityIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">📊</span>
);

export const MicroscopeIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🔬</span>
);

export const FlaskIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🧪</span>
);

export const SunIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">☀️</span>
);

export const WindIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">💨</span>
);

export const CoinsIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🪙</span>
);

export const FuelIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">⛽</span>
);

export const FactoryIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🏭</span>
);

export const MapPinIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">📍</span>
);

export const LandmarkIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🏛️</span>
);

export const BriefcaseIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">💼</span>
);

export const CompassIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🧭</span>
);

export const MapIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🗺️</span>
);

export const EarthIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🌍</span>
);

export const BanknoteIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">💵</span>
);

export const PiggyBankIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🐷</span>
);

export const ServerIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🖥️</span>
);

export const CloudIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">☁️</span>
);

export const SproutIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🌱</span>
);

export const CheckCircleIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">✅</span>
);

export const GemIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">💎</span>
);

export const TrophyIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🏆</span>
);

export const AlertTriangleIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">⚠️</span>
);

export const PlaneIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">✈️</span>
);

export const ScanLineIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">📡</span>
);

export const SmartphoneIconAlt: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">📲</span>
);

export const MonitorIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🖥</span>
);

export const ShoppingCartIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🛒</span>
);

export const CoffeeIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">☕</span>
);

export const PackageIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">📦</span>
);

export const PercentAltIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">💹</span>
);

export const CogIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">⚙️</span>
);

export const BookOpenIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">📖</span>
);

export const BarChart3Icon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">📊</span>
);

// Additional missing icons for nejlepsi-etf pages
export const ChartBarIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">📊</span>
);

export const HistoryIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🕐</span>
);

export const DollarSignIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">💵</span>
);

export const BitcoinIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">₿</span>
);

export const SparklesIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">✨</span>
);

export const MedalIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🏅</span>
);

export const StarIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">⭐</span>
);

export const GraduationCapIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">🎓</span>
);

export const ChevronsUpDownIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">⇅</span>
);

export const CircleIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">●</span>
);

export const DotIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">•</span>
);

export const BarChartIcon: React.FC<IconProps> = ({ className = '' }) => (
  <span className={className} aria-hidden="true">📊</span>
);

// Helper component for star ratings
interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const filledStars = '★'.repeat(Math.min(rating, maxRating));
  const emptyStars = '☆'.repeat(Math.max(0, maxRating - rating));

  return (
    <span className={sizeClasses[size]} aria-label={`Hodnocení ${rating} z ${maxRating}`}>
      <span className="text-yellow-400">{filledStars}</span>
      <span className="text-gray-300">{emptyStars}</span>
    </span>
  );
};
