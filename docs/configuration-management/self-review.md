## Review

### Git

#### Changes tracking

| Attribute    | Scale | Reasoning | 
| -------- | ------- | --- |
| Visibility  | Strong | All the changes are done in [branches](https://github.com/OOO-A2/IT-Product-Development-course/branches) and then merged into main branch, which is available in [GitHub](https://github.com/OOO-A2/IT-Product-Development-course)| 
| Accessibility | Strong | The repository is public |
| Accountability    | Strong | The contributors are listed on the page and each commit has an author |
| Traceability    | Strong | All the changes are documented in [Pull requests](https://github.com/OOO-A2/IT-Product-Development-course/pulls?q=is%3Apr+is%3Aclosed) |
| Evolvability | Absent | Evolving changes tracking is out of scope |


#### Branching and Isolated development

| Attribute    | Scale | Reasoning | 
| -------- | ------- | --- |
| Visibility  | Strong | We have 2 isolated branches for dev ([backend](https://github.com/OOO-A2/IT-Product-Development-course/tree/backend) and [frontend](https://github.com/OOO-A2/IT-Product-Development-course/tree/frontend)) | 
| Accessibility | Strong | The access is via GitHub links |
| Accountability    | Strong | Each commit within a branch has an author as well as responsibilities are strictly split in the team (we have 1 backender and 1 frontender) |
| Traceability    | Present | Decisions or design choices are not provided in the commits |
| Evolvability    | Absent | We don't evolve branching process |


### Communication

#### Notes from customer meetings

| Attribute    | Scale | Reasoning | 
| -------- | ------- | --- |
| Visibility  | Strong | Each sprint in [sprints folder](https://github.com/OOO-A2/IT-Product-Development-course/tree/main/docs/sprints) has meeting file containing recording of meeting (audio and video optionally) as well as action points and summary | 
| Accessibility | Strong | All recorded files are stored in Google Drive and available via links, example for [video](https://drive.google.com/file/d/129HxIwH00XgQ3O8BlQLvEXQxYytHZ7A_/view) and [audio](https://drive.google.com/file/d/1sMcfLFwssvVzKdsUf2Ff_Lz-7ZRRTaMK/view)|
| Accountability    | Present | Notes contain action points for different modules, but no responsible guy attached, [example](https://github.com/OOO-A2/IT-Product-Development-course/blob/main/docs/sprints/sprint-5/meeting.md) |
| Traceability    | Strong | Recordings are decrypted by time with certain words said, [example](https://docs.google.com/document/d/1UHC-vz4FsdHnOoYdh1L_B-EoC5kLrkvc5uuGyZvDBz4/edit?tab=t.0) |
| Evolvability |  Present | Some changes are made from meeting to meeting, for example incorporating video demo in later stages |


### Development Integration

#### Frontend to Backend connection

| Attribute  | Scale | Reasoning | 
| -------- | ------- | ----- |
| Visibility  |  Present | The development is described in [contributing file](https://github.com/OOO-A2/IT-Product-Development-course?tab=contributing-ov-file) but it lacks connection details | 
| Accessibility | Strong | File is publicly available |
| Accountability | Absent    | It's not seen who is responsible for integration documentation |
| Traceability    | Present | The file is connected to version control and reflects the design desicions |
| Evolvability    |  Present | The file describes quality to be traced and evolved with the time |


## Traceability

1. [Git history of changes](https://github.com/OOO-A2/IT-Product-Development-course/commits/main/). How many commits and size of each commit (in lines of code) were accomplished per day or per week/sprint

1. [Checks failed](https://github.com/OOO-A2/IT-Product-Development-course/actions/runs/19671650418/job/56341787364#step:5:15) in lints, tests and types (for TypeScript). Allows to track how much warning we had previously to how many we have now if any unresolved

1. [Number of issues](https://github.com/OOO-A2/IT-Product-Development-course/milestones) planed and solved per Sprint. Allows to understand the capability of a team and level of documentation per issue

## Summary

The major sub-component that should be improved is documentation of workflow and agreement on the integration between frontend and backend as it is the inevitable part of the working product. It should be clear on what endpoints on what pages are triggered, how and which data is transfered, etc. So that further product maintaing will be smooth. 