import { cn } from "@/lib/utils";
import {
  IconAdjustmentsBolt,
  IconCloud,
  IconCurrencyDollar,
  IconEaseInOut,
  IconHeart,
  IconHelp,
  IconRouteAltLeft,
  IconTerminal2,
} from "@tabler/icons-react";

export function FeaturesSectionDemo() {
  const features = [
    {
      title: "Smart Task Categorization",
      description:
        "AI groups tasks into categories like Assignments, Exams, and Projects.",
      icon: <IconTerminal2 className="h-5 w-5 md:h-6 md:w-6" />,
    },
    {
      title: "Auto-Priority Assignment",
      description:
        "The AI suggests which tasks need urgent attention.",
      icon: <IconEaseInOut className="h-5 w-5 md:h-6 md:w-6" />,
    },
    {
      title: "Voice Input Support",
      description:
        "Users can add tasks by speaking (Speech-to-Text)",
      icon: <IconCurrencyDollar className="h-5 w-5 md:h-6 md:w-6" />,
    },
    {
      title: "Recurring Task Management ",
      description: "Automatically repeats daily/weekly tasks (e.g., Review Notes Every Monday)",
      icon: <IconCloud className="h-5 w-5 md:h-6 md:w-6" />,
    },
    {
      title: "Deadline Alerts & Overdue Notifications",
      description: "System notifies users when deadlines approach",
      icon: <IconRouteAltLeft className="h-5 w-5 md:h-6 md:w-6" />,
    },
    {
      title: "24/7 Customer Support",
      description:
        "We are available a 100% of the time. Atleast our AI Agents are.",
      icon: <IconHelp className="h-5 w-5 md:h-6 md:w-6" />,
    },
    {
      title: "Task Summarization",
      description:
        "Converts long notes into concise key points for quick revision.",
      icon: <IconAdjustmentsBolt className="h-5 w-5 md:h-6 md:w-6" />,
    },
    {
      title: "Low Cost",
      description: "Price Effective than any other solutions available",
      icon: <IconHeart className="h-5 w-5 md:h-6 md:w-6" />,
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  relative z-10 py-10 max-w-7xl mx-auto bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col py-6 sm:py-10 relative group/feature dark:border-neutral-800",
        "sm:border-b sm:last:border-b-0 md:border-b-0",
        "sm:even:border-l md:even:border-l-0",
        (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
        index < 4 && "lg:border-b dark:border-neutral-800"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-3 sm:mb-4 relative z-10 px-4 sm:px-10 text-neutral-200 dark:text-neutral-400">
        {icon}
      </div>
      <div className="text-base sm:text-lg font-bold mb-2 relative z-10 px-4 sm:px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-200 dark:text-neutral-100">
          {title}
        </span>
      </div>
      <p className="text-xs sm:text-sm text-neutral-200 dark:text-neutral-300 max-w-xs relative z-10 px-4 sm:px-10">
        {description}
      </p>
    </div>
  );
};
