# Story Update Workflow Checklist

## Pre-Update Validation

- [ ] Story file exists and is readable
- [ ] Agent type is valid (sm, qa, dev)
- [ ] Update section is allowed for agent type
- [ ] Update type is allowed for agent type
- [ ] Update content is provided and properly formatted
- [ ] Backup created (if backup_original is true)

## Agent Permission Checks

### SM (Scrum Master)
- [ ] Can update: story, acceptance_criteria, tasks, dev_notes, status, epic_reference
- [ ] Cannot update: test_requirements, dev_agent_record, file_list
- [ ] Update types allowed: append, replace, prepend, update_field

### QA (Test Architect)
- [ ] Can update: test_requirements, test_cases, qa_notes, test_coverage, validation_notes
- [ ] Cannot update: story, acceptance_criteria, dev_agent_record
- [ ] Update types allowed: append, replace, prepend
- [ ] Requires approval for updates

### Dev (Developer)
- [ ] Can update: dev_agent_record, completion_notes, file_list, change_log, debug_log_references, tasks
- [ ] Cannot update: story, acceptance_criteria, test_requirements
- [ ] Update types allowed: append, replace, prepend, update_field
- [ ] Can update task completion status

## Content Validation

- [ ] Markdown syntax is valid
- [ ] Required sections are preserved
- [ ] Content format matches section requirements
- [ ] No unauthorized sections modified
- [ ] Proper indentation and formatting maintained

## Update Application

- [ ] Target section located correctly
- [ ] Update applied according to update_type
- [ ] Other sections remain unchanged
- [ ] Markdown structure preserved
- [ ] File saved successfully

## Post-Update Validation

- [ ] Story file is readable after update
- [ ] All sections are properly formatted
- [ ] Agent-specific requirements met
- [ ] Change summary generated
- [ ] Approval requested (if required)

## Error Handling

- [ ] Invalid story path handled gracefully
- [ ] Permission denied errors are clear
- [ ] Validation failures are reported
- [ ] Backup restored if update fails
- [ ] User notified of any issues

## Output Verification

- [ ] Success message displayed
- [ ] Change summary provided
- [ ] File path confirmed
- [ ] Backup location noted (if created)
- [ ] Next steps suggested (if applicable)
