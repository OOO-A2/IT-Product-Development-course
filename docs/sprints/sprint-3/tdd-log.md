# Practice Test-driven Development (TDD)

### Link to the Task issue

[Issue #42](https://github.com/orgs/OOO-A2/projects/2/views/1?pane=issue&itemId=140681473&issue=OOO-A2%7CIT-Product-Development-course%7C42) requires a new column on the instructor's dashboard with teams for extra points called 'Extra'


### Number of cycles: draft test + 1

## Commits:

- **Draft test commit**:
    - Reason: Add file with some test that looks for `Extra` text
    - [Add failing test for extra column](https://github.com/OOO-A2/IT-Product-Development-course/pull/46/commits/63167d1a0f8f2025c74f9e0d639810877cc3c554)
    - Comparison to previous approach: Here we first look at final result 'Extra' is written, while previously we will display like 'Team extra' and then think on final result.
- **Failing test**:
    - Reason: Add precise test that check that 'Extra' column is present assuming multiple possible
    - [Refactor test as many columns are to be present](https://github.com/OOO-A2/IT-Product-Development-course/pull/46/commits/17aaf227e1eb13c42d58b38d7885d56d68059270)
    - [Workflow run](https://github.com/OOO-A2/IT-Product-Development-course/actions/runs/19594489775)
    - Results: `Unable to find an element with the text: Extra`
    - Comparison to previous approach: It requires to understand complete view of many columns, while previously we would just add this column in one place without thinking that it might be present in many places
- **Passing test**:
    - Reason: Pass the test by incorporating new extra assignment type to be rendered in the table
    - [Add team extra column `ET` + fix linter](https://github.com/OOO-A2/IT-Product-Development-course/pull/46/commits/a1f47e88eb5864f403d77e45c0a10fc580db9528)
    - [Workflow run](https://github.com/OOO-A2/IT-Product-Development-course/actions/runs/19594501808)
    - Comparison to previous approach: We know how the column should look like (Called `Extra`) and refine namings immediately before running the dashboard and checking manually
- **Refactor**:
    - Reason: Think on what's missing in the column testing and adding more precise location - the text should be in the table
    - [Refactor test to check Extra column is in the `table`](https://github.com/OOO-A2/IT-Product-Development-course/pull/46/commits/3744a05600a980a690a85a843464c12762f7e663)
    - [Workflow run](https://github.com/OOO-A2/IT-Product-Development-course/actions/runs/19594543608)
    - Comparison to previous approach: Here we think on the more precise location and structure of the rendered document, while in previous approach we would just add the column implicitly assuming it is inside required blocks.

