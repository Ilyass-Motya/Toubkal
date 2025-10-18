# Story Update Workflow Instructions

<critical>This workflow allows SM, QA, and Dev agents to update specific sections of user stories with appropriate permissions and validation. Each agent type has different allowed sections and update capabilities.</critical>

## Workflow Overview

This workflow provides controlled story updates based on agent type:
- **SM (Scrum Master)**: Can update story content, acceptance criteria, tasks, and status
- **QA (Test Architect)**: Can update test requirements, test cases, and validation notes
- **Dev (Developer)**: Can update dev records, completion notes, and task status

## Step-by-Step Instructions

<step n="1" goal="Validate Inputs and Load Story">
  <action>Validate required parameters: story_path, agent_type</action>
  <action>If story_path is empty, search story_dir for available stories</action>
  <action>Load the target story markdown file</action>
  <action>Parse story structure and identify available sections</action>
  <check>If story not found → HALT with error message</check>
</step>

<step n="2" goal="Validate Agent Permissions">
  <action>Determine agent_type if set to "auto" (from context or user input)</action>
  <action>Load agent permissions from workflow configuration</action>
  <action>Validate agent_type is one of: "sm", "qa", "dev"</action>
  <action>Check if update_section is allowed for the agent_type</action>
  <action>Check if update_type is allowed for the agent_type</action>
  <check>If permissions denied → HALT with clear error message</check>
</step>

<step n="3" goal="Prepare Update Content">
  <action>If update_content is empty → ASK user for content</action>
  <action>Format content according to update_type:
    - append: Add to end of section
    - replace: Replace entire section content
    - prepend: Add to beginning of section
    - update_field: Update specific field value
  </action>
  <action>Validate content format matches section requirements</action>
  <action>If backup_original is true → Create backup of original file</action>
</step>

<step n="4" goal="Apply Updates to Story">
  <action>Parse the story markdown structure</action>
  <action>Locate the target section for update</action>
  <action>Apply the update based on update_type:
    - For "append": Add content to end of section
    - For "replace": Replace section content entirely
    - For "prepend": Add content to beginning of section
    - For "update_field": Update specific field value
  </action>
  <action>Maintain proper markdown formatting</action>
  <action>Preserve other sections unchanged</action>
</step>

<step n="5" goal="Validate Updated Story">
  <action>If validation_mode != "skip" → Run validation checks:
    - Check markdown syntax is valid
    - Verify required sections are present
    - Validate agent-specific requirements
  </action>
  <action>If validation fails and validation_mode == "strict" → HALT with error</action>
  <action>If validation fails and validation_mode == "lenient" → Show warnings but continue</action>
</step>

<step n="6" goal="Save and Report Changes">
  <action>Save the updated story file</action>
  <action>Generate change summary:
    - Agent type and permissions used
    - Section updated
    - Update type applied
    - Content added/modified
    - Validation results
  </action>
  <action>If requires_approval is true for agent_type → Request user approval</action>
  <action>Report success with change summary</action>
</step>

## Agent-Specific Update Rules

### SM (Scrum Master) Updates
- **Allowed Sections**: story, acceptance_criteria, tasks, dev_notes, status, epic_reference
- **Update Types**: append, replace, prepend, update_field
- **Special Rules**: 
  - Can update story status (TODO → IN PROGRESS → DONE)
  - Can modify acceptance criteria with proper justification
  - Can add/remove tasks and subtasks
  - Updates require no approval

### QA (Test Architect) Updates
- **Allowed Sections**: test_requirements, test_cases, qa_notes, test_coverage, validation_notes
- **Update Types**: append, replace, prepend
- **Special Rules**:
  - Focus on test-related content only
  - Can add test cases and validation requirements
  - Updates require approval from SM or Dev
  - Cannot modify core story requirements

### Dev (Developer) Updates
- **Allowed Sections**: dev_agent_record, completion_notes, file_list, change_log, debug_log_references, tasks
- **Update Types**: append, replace, prepend, update_field
- **Special Rules**:
  - Can update task completion status (checkboxes)
  - Can add implementation notes and file references
  - Can update change log with implementation details
  - Updates require no approval for dev-specific sections

## Error Handling

<check if="story not found">
  <action>HALT with error: "Story file not found at {{story_path}}"</action>
</check>

<check if="invalid agent type">
  <action>HALT with error: "Invalid agent_type '{{agent_type}}'. Must be 'sm', 'qa', or 'dev'"</action>
</check>

<check if="permission denied">
  <action>HALT with error: "Agent '{{agent_type}}' not allowed to update section '{{update_section}}'"</action>
</check>

<check if="validation fails and strict mode">
  <action>HALT with error: "Story validation failed. Check content format and try again."</action>
</check>

## Output Format

The workflow will report:
- ✅ Story updated successfully
- Agent type and permissions used
- Section(s) modified
- Update type applied
- Validation results
- File path and backup location (if created)
