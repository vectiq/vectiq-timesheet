import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Search, ChevronRight, Book, Clock, Users, FileText, TrendingUp, BarChart2, Settings } from 'lucide-react';

const sections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Book,
    description: 'Learn the basics of using the timesheet system',
    topics: [
      {
        title: 'System Overview',
        content: `
The timesheet system is a comprehensive solution for managing time entries, project tracking, and billing. Key features include:

- Time entry management with weekly and monthly views
- Project and client management
- Leave request handling
- Automated approval workflows
- Reporting and analytics
- Forecast planning
- Integration with Xero for accounting

The system uses role-based access control with two main roles:
- Users: Can submit time entries and leave requests
- Administrators: Full system access including project management and reporting
        `
      },
      {
        title: 'First-time Setup',
        content: `
To get started with the system:

1. Log in using your provided credentials
2. Complete your profile setup including:
   - Personal details
   - Working hours preferences
   - Rate information (if applicable)
3. Review your project assignments
4. Familiarize yourself with the weekly timesheet view

For administrators:
- Configure system settings in the Admin section
- Set up client and project information
- Configure approval workflows
- Set up user accounts and permissions
        `
      }
    ]
  },
  {
    id: 'time-entries',
    title: 'Time Entries',
    icon: Clock,
    description: 'Managing and submitting time entries',
    topics: [
      {
        title: 'Weekly View',
        content: `
The weekly view is the primary interface for entering time:

- Shows a full week of time entries
- Displays all assigned projects and tasks
- Allows quick entry of hours
- Supports copying from previous weeks
- Shows approval status for entries

Features:
- Click cells to enter hours
- Use tab key to navigate between cells
- Automatic saving of entries
- Visual indicators for approval status
- Weekly totals calculation
        `
      },
      {
        title: 'Monthly View',
        content: `
The monthly view provides an overview of all time entries:

- Grouped by client and project
- Shows approval status
- Displays monthly totals
- Allows submission for approval

Key features:
- Expandable project sections
- Approval status tracking
- Monthly summary statistics
- Export capabilities
        `
      }
    ]
  },
  {
    id: 'projects',
    title: 'Projects',
    icon: FileText,
    description: 'Project management and configuration',
    topics: [
      {
        title: 'Project Setup',
        content: `
Projects are the core organizational unit for time tracking:

Project Configuration:
- Basic Information:
  - Name and client association
  - Start and end dates
  - Budget tracking
  - Approval requirements

Task Setup:
- Define billable tasks
- Set cost and sell rates
- Configure overtime eligibility
- Assign team members

Approval Workflow:
- Set approver email
- Configure approval requirements
- Define approval thresholds
        `
      },
      {
        title: 'User Assignments',
        content: `
Managing project assignments:

- Assign users to specific tasks
- Set user-specific rates
- Configure work schedules
- Manage permissions

Assignment Features:
- Bulk assignment tools
- Rate inheritance rules
- Schedule templates
- Access control settings
        `
      }
    ]
  },
  {
    id: 'forecasting',
    title: 'Forecasting',
    icon: TrendingUp,
    description: 'Resource planning and forecasting',
    topics: [
      {
        title: 'Monthly Forecasts',
        content: `
The forecasting module helps plan resource allocation:

Features:
- Monthly hour allocation
- Revenue forecasting
- Resource utilization planning
- Capacity planning

Key Concepts:
- Default hours calculation
- Working days tracking
- Public holiday handling
- Overtime planning
        `
      },
      {
        title: 'Forecast Reports',
        content: `
Understanding forecast reports:

Components:
- Actual vs forecast comparison
- Variance analysis
- Revenue projections
- Utilization metrics

Analysis Tools:
- Trend visualization
- Variance highlighting
- Export capabilities
- Custom reporting
        `
      }
    ]
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: BarChart2,
    description: 'Analytics and reporting capabilities',
    topics: [
      {
        title: 'Time Reports',
        content: `
Comprehensive time reporting features:

Report Types:
- Detailed time entries
- Project summaries
- Client billing
- User utilization

Features:
- Custom date ranges
- Multiple export formats
- Filtering capabilities
- Drill-down analysis
        `
      },
      {
        title: 'Financial Reports',
        content: `
Financial analysis and reporting:

Available Reports:
- Revenue analysis
- Cost tracking
- Margin calculations
- Budget vs actual

Key Features:
- Rate calculations
- Currency handling
- Tax considerations
- Profit analysis
        `
      }
    ]
  },
  {
    id: 'admin',
    title: 'Administration',
    icon: Settings,
    description: 'System administration and configuration',
    topics: [
      {
        title: 'System Configuration',
        content: `
Core system settings and configuration:

Settings Categories:
- Default configurations
- Working hours
- Approval workflows
- Integration settings

Key Areas:
- User management
- Role configuration
- Email templates
- System defaults
        `
      },
      {
        title: 'Xero Integration',
        content: `
Managing the Xero accounting integration:

Setup Process:
1. Configure API credentials
2. Set up organization mapping
3. Configure sync settings
4. Test connection

Features:
- Invoice sync
- Contact management
- Payment tracking
- Leave management
        `
      }
    ]
  }
];

export default function Help() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Filter sections based on search
  const filteredSections = sections.filter(section => {
    const matchesSearch = (
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.topics.some(topic => 
        topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        topic.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    return matchesSearch;
  });

  const currentSection = sections.find(s => s.id === selectedSection);
  const currentTopic = currentSection?.topics.find(t => t.title === selectedTopic);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Help & Support</h1>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search documentation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Section List */}
        <div className="col-span-12 lg:col-span-3">
          <nav className="space-y-1">
            {filteredSections.map(section => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    setSelectedSection(section.id);
                    setSelectedTopic(null);
                  }}
                  className={`
                    w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg
                    ${selectedSection === section.id
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{section.title}</span>
                  <ChevronRight className={`
                    ml-auto h-4 w-4 transition-transform
                    ${selectedSection === section.id ? 'rotate-90' : ''}
                  `} />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="col-span-12 lg:col-span-9">
          {selectedSection && !selectedTopic ? (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">{currentSection?.title}</h2>
              <p className="text-gray-600 mb-6">{currentSection?.description}</p>
              
              <div className="grid gap-4 sm:grid-cols-2">
                {currentSection?.topics.map(topic => (
                  <button
                    key={topic.title}
                    onClick={() => setSelectedTopic(topic.title)}
                    className="text-left p-4 rounded-lg border hover:border-indigo-500 hover:shadow-md transition-all"
                  >
                    <h3 className="font-medium text-gray-900">{topic.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {topic.content.split('\n')[0]}
                    </p>
                  </button>
                ))}
              </div>
            </Card>
          ) : selectedTopic ? (
            <Card className="p-6">
              <button
                onClick={() => setSelectedTopic(null)}
                className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
              >
                <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
                Back to {currentSection?.title}
              </button>
              
              <h2 className="text-xl font-semibold mb-4">{currentTopic?.title}</h2>
              <div className="prose prose-indigo max-w-none">
                {currentTopic?.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 whitespace-pre-wrap">{paragraph}</p>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Welcome to Help & Support</h2>
              <p className="text-gray-600">
                Select a topic from the left to view detailed documentation and guides.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}