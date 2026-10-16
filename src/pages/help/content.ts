import type { UserRole } from '@/lib/auth/context';

/**
 * Text for the Help page. Kept apart from the layout so wording can be changed without touching
 * the component. Everything here describes what the app does today; update it with the app.
 */

export interface PageGuide {
  name: string;
  path: string;
  roles: UserRole[];
  summary: string;
}

const everyone: UserRole[] = ['admin', 'client_admin', 'client_user'];

export const pageGuides: PageGuide[] = [
  {
    name: 'Decision Trees',
    path: '/review-trees',
    roles: everyone,
    summary:
      'The list of scoring trees for your company. Search by name, then open one with Visualize (run claims through it and see the path) or Struct (see the tree\'s structure).',
  },
  {
    name: 'Datasets',
    path: '/datasets',
    roles: everyone,
    summary:
      'The claim files uploaded for your company. Open a dataset for its Overview, Data Grid and Schema Map (how its columns were matched). Admins and Client Admins can upload and delete.',
  },
  {
    name: 'Table Visualizer',
    path: '/table-visualizer',
    roles: everyone,
    summary:
      'Where claims get scored. Pick a tree (or switch to Rules), load a dataset or a CSV, choose the claim number column and press Evaluate. Browse the results as a table or as analytics.',
  },
  {
    name: 'Rules',
    path: '/rules',
    roles: everyone,
    summary:
      'One set of rules per dataset, written as plain sentences such as "Total Loss equals Yes". Each rule marks matching claims as Moderate or High. Admins and Client Admins can create and edit them.',
  },
  {
    name: 'Company Overview',
    path: '/company',
    roles: ['client_admin'],
    summary:
      'Your company\'s user slots (total, used, available), a button to request more slots, and recent activity.',
  },
  {
    name: 'Company Users',
    path: '/company/users',
    roles: ['client_admin'],
    summary: 'Add people to your company, edit their name and role, and deactivate or reactivate them.',
  },
];

export interface TaskGuide {
  title: string;
  roles: UserRole[];
  steps: string[];
}

export const taskGuides: TaskGuide[] = [
  {
    title: 'Score a file of claims',
    roles: everyone,
    steps: [
      'Open Table Visualizer from the left menu. Leave the mode on Trees.',
      'Under Decision Tree Model, choose the tree to use. Click the box and start typing the name to find it quickly.',
      'Under Data Source, either use the Upload tab to drop in a CSV, or the Dataset tab to pick a file already uploaded for your company and press Load Dataset.',
      'Under Validation Status, choose the Claim Number Column (the column that holds each claim\'s ID). The status turns to Ready when all the columns the tree needs are present. If it lists missing columns, the file does not match the tree.',
      'Press Evaluate with Trees. The table fills with results.',
      'Use the STP, Moderate and High Risk buttons above the table to filter, and the search box on the left to find a claim number.',
      'Click any claim to open its decision trace: the path it took through each tree and how its score was made up.',
      'Press Export Results to save the scored claims as a file.',
    ],
  },
  {
    title: 'Upload a dataset',
    roles: ['admin', 'client_admin'],
    steps: [
      'Open Datasets and press Upload Dataset.',
      'Choose the claims file, then fill in the form: the Insurance Company and the Country/Region (both required), a Dataset Nickname if you want a name you will recognise, and the level the data is at.',
      'Wait for the status to change to Uploaded. The file is checked and its columns are matched to the standard claim fields.',
      'Open the dataset and go to its Schema Map tab to review how the columns were matched. If one was matched wrongly, edit the mapping and save; the aligned file is rebuilt.',
    ],
  },
  {
    title: 'Write and use rules',
    roles: ['admin', 'client_admin'],
    steps: [
      'Open Rules and press Create Rules (or Edit Rules) on the dataset card.',
      'Pick a field from the Fields panel, or type in the box at the bottom, for example: Total Loss equals Yes. Press Enter to add the rule.',
      'Choose the risk effect for the rule, Moderate or High, before you add it.',
      'Your changes are saved automatically (the top bar says Auto-saved).',
      'To use the rules, open Table Visualizer, switch the mode to Rules, choose the dataset and evaluate. Claims that match a rule are flagged with its effect.',
    ],
  },
  {
    title: 'Register a user',
    roles: ['admin', 'client_admin'],
    steps: [
      'Open Users in the left menu and press Register User.',
      'Enter their work email and full name, and choose their role. Admins also choose the company. A Client User can only look at results; a Client Admin can also manage data and users.',
      'The person signs in with their email address: they receive a code, no password is needed.',
      'To remove access later, use the power button on their row to deactivate them. Deactivated people stop using up a slot.',
    ],
  },
  {
    title: 'Ask for more user slots',
    roles: ['client_admin'],
    steps: [
      'Open Company Overview. The cards show total, used and available slots.',
      'In the Slot Request box, press Request More Slots, say how many extra you need and confirm.',
      'An Admin reviews it. Until it is decided the box shows Pending Request, and Cancel Pending Request withdraws it.',
    ],
  },
];

export const glossary: { term: string; meaning: string }[] = [
  {
    term: 'Probability',
    meaning:
      'The model\'s score for a claim, shown as a percentage. A higher score means the claim deserves a closer look. It is a review priority, not a verdict: a high score does not mean a claim is fraudulent.',
  },
  { term: 'STP (Low risk)', meaning: 'Straight-through processing: probability below 50%. These claims can usually go through the normal flow.' },
  { term: 'Moderate', meaning: 'Probability from 50% up to 75%. Worth a second look.' },
  { term: 'High risk', meaning: 'Probability of 75% or more. Prioritise these for review.' },
  {
    term: 'Decision trace',
    meaning:
      'For one claim, the route it took through each tree and the value each tree added. Their total is the claim\'s score.',
  },
  { term: 'Dataset', meaning: 'A file of claims uploaded to ClaimCPU, belonging to one company.' },
  { term: 'Slot', meaning: 'One place for an active user in a company. Deactivated users do not use a slot.' },
];

export const tips: string[] = [
  'Every dropdown of names (trees, datasets, companies, columns) is searchable: click it and type part of a name, then press Enter or click the one you want. Nothing is chosen until you pick it.',
  'Search boxes suggest real names as you type. Pick a suggestion to fill it in exactly, or just keep typing to search.',
  'The sun and moon button at the top right switches between light and dark.',
  'The arrow at the top of the left menu collapses it to icons when you need more room.',
  'In Table Visualizer, switch to Analytics view for a summary of how the claims are spread across the three lanes.',
];

export const troubleshooting: { problem: string; answer: string }[] = [
  {
    problem: 'The Evaluate button is greyed out',
    answer:
      'You need all three: a tree (or a dataset with rules in Rules mode), loaded data, and a claim number column chosen under Validation Status.',
  },
  {
    problem: 'Validation lists missing columns',
    answer:
      'The file does not contain every column the selected tree uses. Pick a tree built for this kind of data, or upload a file that includes those columns.',
  },
  {
    problem: 'I cannot upload, edit rules or add users',
    answer:
      'Those actions are for Admins and Client Admins. A Client User can view and score but not change data. Ask your Client Admin if you need the change made.',
  },
  {
    problem: 'Company has reached max user slots',
    answer:
      'Every slot is in use. Deactivate someone who no longer needs access, or ask for more slots on Company Overview.',
  },
  {
    problem: 'Something else looks wrong',
    answer:
      'Contact your eData administrator and tell them the page you were on and what you clicked. A screenshot helps.',
  },
];
