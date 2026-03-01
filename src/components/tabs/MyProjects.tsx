import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Briefcase, Star, Filter, X } from 'lucide-react';
import { Badge, Button, Card } from '../ui';
import projectsData from '../../data/my-projects.json';
import interviewsData from '../../data/mock-interviews.json';

// ── Types ────────────────────────────────────────────────────────────────────

interface Project {
  id: string;
  name: string;
  shortName: string;
  duration: string;
  tags: string[];
  metrics: string;
  headline: string;
  starStory: string;
}

interface Mapping {
  questionKey: string;
  projectIds: string[];
  relevanceNote: string;
}

interface Interview {
  id: number;
  title: string;
  duration: number;
  questions: Question[];
}

interface Question {
  id: number;
  question: string;
  difficulty: string;
  category: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const tagColorMap: Record<string, 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple'> = {
  SQL: 'blue',
  'Data Modeling': 'purple',
  'System Design': 'red',
  'Product Sense': 'green',
  Behavioral: 'yellow',
};

const roundCategory = (title: string): string => {
  if (title.toLowerCase().includes('sql')) return 'SQL';
  if (title.toLowerCase().includes('model')) return 'Data Modeling';
  if (title.toLowerCase().includes('pipeline') || title.toLowerCase().includes('design')) return 'System Design';
  if (title.toLowerCase().includes('product')) return 'Product Sense';
  if (title.toLowerCase().includes('behavioral')) return 'Behavioral';
  return 'General';
};

// ── Sub-components ───────────────────────────────────────────────────────────

interface ProjectCardProps {
  project: Project;
  isSelected: boolean;
  questionCount: number;
  onClick: () => void;
}

const ProjectCard = ({ project, isSelected, questionCount, onClick }: ProjectCardProps) => (
  <Card
    hover
    onClick={onClick}
    padding="sm"
    className={[
      'transition-all duration-200',
      isSelected
        ? 'ring-2 ring-amber-400 dark:ring-amber-500 border-amber-300 dark:border-amber-600'
        : 'hover:border-amber-200 dark:hover:border-amber-700',
    ].join(' ')}
  >
    <div className="p-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Briefcase
            size={15}
            className={isSelected ? 'text-amber-500 shrink-0' : 'text-gray-400 dark:text-gray-500 shrink-0'}
          />
          <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
            {project.shortName}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge
            label={`${questionCount}q`}
            color="yellow"
            size="sm"
            className="font-mono"
          />
          <span className="text-xs text-gray-400 dark:text-gray-500">{project.duration}</span>
        </div>
      </div>

      {/* Headline */}
      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
        {project.headline}
      </p>

      {/* Metrics — monospace terminal style */}
      <p className="font-mono text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded px-2 py-1 leading-relaxed mb-3">
        {project.metrics}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1">
        {project.tags.map((tag) => (
          <Badge
            key={tag}
            label={tag}
            color={tagColorMap[tag] ?? 'gray'}
            size="sm"
          />
        ))}
      </div>
    </div>
  </Card>
);

interface ProjectDetailProps {
  project: Project;
  mappings: Mapping[];
  interviews: Interview[];
  onClose: () => void;
}

const ProjectDetail = ({ project, mappings, interviews, onClose }: ProjectDetailProps) => {
  const projectMappings = mappings.filter((m) => m.projectIds.includes(project.id));

  return (
    <div className="mt-4 rounded-lg border border-amber-200 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10 p-4">
      {/* STAR story */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Star size={14} className="text-amber-500 shrink-0 mt-0.5" />
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            STAR Story
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Close detail"
        >
          <X size={14} />
        </button>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
        {project.starStory}
      </p>

      {/* Linked questions */}
      {projectMappings.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            Answers {projectMappings.length} interview question{projectMappings.length !== 1 ? 's' : ''}
          </p>
          <div className="space-y-2">
            {projectMappings.map((mapping) => {
              const [roundId, questionId] = mapping.questionKey.split('-').map(Number);
              const round = interviews.find((i) => i.id === roundId);
              const question = round?.questions.find((q) => q.id === questionId);
              if (!round || !question) return null;
              return (
                <div
                  key={mapping.questionKey}
                  className="flex items-start gap-2 text-xs bg-white dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700 p-2"
                >
                  <span className="font-mono text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                    R{roundId}Q{questionId}
                  </span>
                  <div className="min-w-0">
                    <p className="text-gray-700 dark:text-gray-300 leading-snug line-clamp-2">
                      {question.question}
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 mt-0.5 italic">
                      {mapping.relevanceNote}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────

const MyProjects = () => {
  const [expandedRoundId, setExpandedRoundId] = useState<number | null>(1);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const projects: Project[] = projectsData.projects;
  const mappings: Mapping[] = projectsData.mappings;
  const interviews: Interview[] = interviewsData.mockInterviews;

  const { questionToProjects, projectById, projectQuestionCount } = useMemo(() => {
    const questionToProjects = new Map<string, string[]>();
    mappings.forEach((m) => questionToProjects.set(m.questionKey, m.projectIds));

    // Pre-compute project lookup map (fixes .find() in loops too)
    const projectById = new Map<string, Project>();
    projects.forEach((p) => projectById.set(p.id, p));

    // Fix O(n²) → O(n): count using projectIds arrays directly
    const projectQuestionCount = new Map<string, number>();
    projects.forEach((p) => projectQuestionCount.set(p.id, 0));
    mappings.forEach((m) => {
      m.projectIds.forEach((pid) => {
        projectQuestionCount.set(pid, (projectQuestionCount.get(pid) ?? 0) + 1);
      });
    });

    return { questionToProjects, projectById, projectQuestionCount };
  }, [mappings, projects]);

  const selectedProject = selectedProjectId ? (projectById.get(selectedProjectId) ?? null) : null;

  // When a filter is active, only show projects that answer questions in that filter set
  const visibleProjects = selectedProjectId
    ? projects.filter((p) => p.id === selectedProjectId)
    : projects;

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId((prev) => (prev === projectId ? null : projectId));
  };

  const clearFilter = () => setSelectedProjectId(null);

  return (
    <div className="container mx-auto px-4 py-8 pb-36 md:pb-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-gray-100">
          My Projects
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Real experience mapped to Meta E5 interview questions. Click any project chip to filter,
          or click a project card to see its STAR story and linked questions.
        </p>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1">
          <span className="font-semibold text-amber-600 dark:text-amber-400">{projects.length}</span> projects
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1">
          <span className="font-semibold text-amber-600 dark:text-amber-400">{mappings.length}</span> question mappings
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1">
          <span className="font-semibold text-amber-600 dark:text-amber-400">{interviews.length}</span> interview rounds
        </div>
        {selectedProjectId && (
          <button
            onClick={clearFilter}
            className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-full px-3 py-1 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
          >
            <Filter size={11} />
            Filtering: {selectedProjectId ? projectById.get(selectedProjectId)?.shortName : ''}
            <X size={11} />
          </button>
        )}
      </div>

      {/* Two-pane layout */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── Left pane: Interview rounds ─────────────────────────────────── */}
        <div className="lg:w-[55%] space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
            Interview Rounds
          </h2>

          {interviews.map((interview) => {
            const isExpanded = expandedRoundId === interview.id;
            const category = roundCategory(interview.title);

            return (
              <Card key={interview.id} padding="none" className="overflow-hidden">
                {/* Round header */}
                <button
                  className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setExpandedRoundId(isExpanded ? null : interview.id)}
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs text-gray-400 dark:text-gray-500 shrink-0">
                      R{interview.id}
                    </span>
                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">
                      {interview.title}
                    </span>
                    <Badge
                      label={category}
                      color={tagColorMap[category] ?? 'gray'}
                      size="sm"
                      className="hidden sm:inline-flex shrink-0"
                    />
                  </div>
                  <span className="ml-2 shrink-0 text-gray-400">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </button>

                {/* Questions list */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                    {interview.questions.map((question) => {
                      const key = `${interview.id}-${question.id}`;
                      const linkedProjectIds = questionToProjects.get(key) ?? [];

                      return (
                        <div key={key} className="px-4 py-3">
                          {/* Question text */}
                          <div className="flex items-start gap-2 mb-2">
                            <span className="font-mono text-xs text-gray-400 dark:text-gray-500 shrink-0 mt-0.5">
                              Q{question.id}
                            </span>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">
                              {question.question}
                            </p>
                          </div>

                          {/* Project chips */}
                          {linkedProjectIds.length > 0 && (
                            <div className="flex items-center flex-wrap gap-1.5 ml-6">
                              <span className="text-xs text-gray-400 dark:text-gray-500 mr-0.5">
                                Your experience:
                              </span>
                              {linkedProjectIds.map((pid) => {
                                const proj = projectById.get(pid);
                                if (!proj) return null;
                                const isActive = selectedProjectId === pid;
                                return (
                                  <button
                                    key={pid}
                                    onClick={() => handleProjectSelect(pid)}
                                    className={[
                                      'inline-flex items-center text-xs rounded-full px-2 py-0.5 font-medium transition-colors duration-150',
                                      isActive
                                        ? 'bg-amber-400 text-amber-900 dark:bg-amber-500 dark:text-amber-950'
                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800/50',
                                    ].join(' ')}
                                  >
                                    {proj.shortName}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* ── Right pane: Project cards ────────────────────────────────────── */}
        <div className="lg:w-[45%]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              {selectedProjectId ? 'Selected Project' : 'All Projects'}
            </h2>
            {selectedProjectId && (
              <Button variant="ghost" size="sm" onClick={clearFilter} icon={<X size={13} />}>
                Show all
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {visibleProjects.map((project) => (
              <div key={project.id}>
                <ProjectCard
                  project={project}
                  isSelected={selectedProjectId === project.id}
                  questionCount={projectQuestionCount.get(project.id) ?? 0}
                  onClick={() => handleProjectSelect(project.id)}
                />
                {selectedProjectId === project.id && selectedProject && (
                  <ProjectDetail
                    project={selectedProject}
                    mappings={mappings}
                    interviews={interviews}
                    onClose={clearFilter}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Show remaining projects (not selected) when filter is active */}
          {selectedProjectId && (
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
                Other Projects
              </p>
              <div className="space-y-2">
                {projects
                  .filter((p) => p.id !== selectedProjectId)
                  .map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      isSelected={false}
                      questionCount={projectQuestionCount.get(project.id) ?? 0}
                      onClick={() => handleProjectSelect(project.id)}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProjects;
