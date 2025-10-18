# Story Update Workflow

## Overview

The Story Update workflow provides controlled, agent-specific updates to user stories with appropriate permissions and validation. This ensures that different team members can only modify the sections they're authorized to change, maintaining story integrity while enabling collaborative updates.

## Purpose

- **Controlled Updates**: Each agent type (SM, QA, Dev) can only update specific sections
- **Permission Management**: Enforces role-based access to story sections
- **Validation**: Ensures updates maintain story structure and quality
- **Audit Trail**: Tracks who made what changes and when
- **Backup Safety**: Creates backups before making changes

## Agent Types and Permissions

### SM (Scrum Master)
- **Can Update**: story, acceptance_criteria, tasks, dev_notes, status, epic_reference
- **Update Types**: append, replace, prepend, update_field
- **Approval Required**: No
- **Use Cases**: Story refinement, task management, status updates

### QA (Test Architect)
- **Can Update**: test_requirements, test_cases, qa_notes, test_coverage, validation_notes
- **Update Types**: append, replace, prepend
- **Approval Required**: Yes
- **Use Cases**: Test case development, validation requirements

### Dev (Developer)
- **Can Update**: dev_agent_record, completion_notes, file_list, change_log, debug_log_references, tasks
- **Update Types**: append, replace, prepend, update_field
- **Approval Required**: No (for dev-specific sections)
- **Use Cases**: Implementation progress, task completion, technical notes

## Usage Examples

### SM Updating Story Status
```yaml
story_path: "docs/stories/story-001.md"
agent_type: "sm"
update_section: "status"
update_type: "update_field"
field_name: "Status"
field_value: "Ready for Development"
```

### QA Adding Test Cases
```yaml
story_path: "docs/stories/story-001.md"
agent_type: "qa"
update_section: "test_cases"
update_type: "append"
update_content: |
  - [ ] Test case 1: Verify telemetry is disabled
  - [ ] Test case 2: Confirm no network requests to telemetry endpoints
```

### Dev Updating Task Completion
```yaml
story_path: "docs/stories/story-001.md"
agent_type: "dev"
update_section: "tasks"
update_type: "update_field"
field_name: "Task 1"
field_value: "✅ Completed"
```

## Workflow Parameters

### Required Parameters
- `story_path`: Path to the story markdown file
- `agent_type`: Type of agent making the update (sm, qa, dev)

### Optional Parameters
- `update_section`: Specific section to update
- `update_content`: Content to add/update
- `update_type`: How to apply the update (append, replace, prepend, update_field)
- `field_name`: For field updates, which field to modify
- `field_value`: For field updates, the new value
- `validation_mode`: strict, lenient, or skip
- `backup_original`: Create backup before updating (default: true)
- `auto_commit`: Automatically commit changes (default: false)

## Validation Rules

### Content Validation
- Markdown syntax must be valid
- Required sections must be preserved
- Content format must match section requirements
- No unauthorized sections can be modified

### Permission Validation
- Agent type must be valid
- Update section must be allowed for agent type
- Update type must be allowed for agent type
- Approval required for QA updates

### Story Structure Validation
- Story file must be readable
- Target section must exist
- Update must maintain story integrity
- Other sections must remain unchanged

## Error Handling

The workflow handles various error conditions:
- **Story not found**: Clear error message with suggested paths
- **Invalid agent type**: Lists valid options
- **Permission denied**: Shows what sections the agent can update
- **Validation failure**: Provides specific error details
- **Update failure**: Restores backup if available

## Integration with Other Workflows

This workflow integrates with:
- **Story Context**: Can be called after story context generation
- **Dev Story**: Can be called during development for progress updates
- **Review Story**: Can be called after review for corrections
- **Story Ready**: Can be called to update story status

## Best Practices

1. **Always backup**: Enable backup_original for important updates
2. **Validate content**: Use strict validation for production updates
3. **Check permissions**: Verify agent type before making updates
4. **Test updates**: Use lenient validation for testing
5. **Document changes**: Include clear change descriptions
6. **Follow conventions**: Use consistent formatting and structure

## Troubleshooting

### Common Issues
- **Permission denied**: Check agent type and allowed sections
- **Section not found**: Verify section name and story structure
- **Validation failed**: Check content format and requirements
- **Update not applied**: Verify update_type and content format

### Debug Steps
1. Check story file exists and is readable
2. Verify agent type is valid
3. Confirm update section is allowed
4. Validate content format
5. Check validation mode settings
6. Review error messages for specific issues
