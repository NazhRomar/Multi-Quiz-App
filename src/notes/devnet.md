# DevNet Associate (DEVASC): Study Notes

# Module 1: Course Introduction

**Module objective:** Use basic Python programming and Linux skills.

| Topic | Objective |
|---|---|
| **Your Lab Environment** | Install a virtual lab environment. |
| **Linux** | Manage the Linux file system and permissions. |
| **Python** | Use basic Python programming. |

## What the Course Covers

The DevNet Associate (DEVASC) course teaches network programming and automation: basic coding, networking concepts, and writing code in Python.

The industry shift toward automation is driven by **Application Programming Interfaces (APIs)**. APIs remove repetitive manual tasks and let applications share data, request actions, or notify each other when an event happens.

| Course module | What it adds |
|---|---|
| **Software Development and Design** | Main software development concepts and tools for writing quality code. |
| **Understanding and Using APIs** | APIs, their benefits, and how to troubleshoot them. |
| **Network Fundamentals** | Network basics. The network lets applications and clients communicate. |
| **Application Deployment and Security** | Securing networks and applications; choosing a deployment type. |
| **Infrastructure and Automation** | Infrastructure as code: managing infrastructure with automation instead of manual setup. |
| **Cisco Platforms and Development** | Collaboration, compute (data centers), networking (data models), and security. |

- **Network programmability:** the ability to configure, monitor, and react to events in the network in real time.
- **Infrastructure as code:** managing the infrastructure with automation instead of setting it up manually.

Course goals (what learners should be able to do):

- Use basic Python programming and Linux skills.
- Implement a development environment using DevNet resources.
- Use software development and design best practices.
- Create REST API requests over HTTPS to securely integrate services.
- Explain the processes and devices that support network connectivity.
- Use current technologies to deploy and secure applications and data in a cloud environment.
- Compare software testing and deployment methods in automation and simulation environments.
- Compare Cisco platforms used for collaboration, infrastructure management, and automation.

## Lab Environment (Virtual Machines)

- **Virtualization:** one or more virtual computers run inside one physical computer.
- **Virtual machine (VM):** a virtual computer running inside a physical one. VMs are called **guests**.
- **Host:** the physical computer the VMs run on.
- The course labs run on a Linux-based VM called the **DEVASC VM**.

**Lab: Install the Virtual Lab Environment**

1. Prepare a Computer for Virtualization
2. Explore the DEVASC VM GUI
3. Create Lab Environment Accounts
4. Install Webex Teams on your Device

## Linux

Linux runs on servers, IoT devices, networking equipment, and smartphones. All the coding labs in this course run on the Linux-based DEVASC VM.

**Lab: Linux Review**

1. Launch the DEVASC VM
2. Review Command Syntax Navigation
3. Review File Management
4. Review Regular Expressions
5. Review System Administration

## Python

Why Python (from the Python Essentials course):

- **Easy to learn:** less time to learn than many other languages, so you start programming sooner.
- **Easy to use for writing new software:** code is often faster to write.
- **Easy to obtain, install and deploy:** free, open and multiplatform.
- **Good first language:** a solid foundation that makes C++, Java, or C easier to learn later.

**Lab: Python Programming Review**

1. Launch the DEVASC VM
2. Start Python and VS Code
3. Review Data Types and Variables
4. Review Lists and Dictionaries
5. Review the Input Function
6. Review If, For, and While Functions
7. Review Methods for File Access

# Module 2: The DevNet Developer Environment

**Module objective:** Implement a development environment using DevNet resources.

| Topic | Objective |
|---|---|
| **DevNet Overview** | Explain how DevNet encourages communities of network programmers. |
| **Exploring DevNet Online Resources** | Investigate DevNet online resources. |

## What is DevNet?

**DevNet:** a fully-integrated developer program made up of a website, an interactive developer community, coordinated developer tools, integrated discussion forums, and sandboxes.

| Feature | What it is |
|---|---|
| **Learning Labs** | Self-paced tutorials, from basic coding to using REST APIs with various technologies. |
| **Sandboxes** | Production-like development and testing environments for many technologies. |
| **Code Exchange** | A repository of sample code written by other developers. |
| **Developer support** | Help with developer issues through tickets, live chats, and forums. |
| **Developer documentation** | A central location for all product developer (API) documentation. |

Extra resources (not required for the course):

- **Video courses:** instructor-led videos with hands-on exercises.
- **DevNet events:** events worldwide where DevNet developers teach classes and run hands-on workshops.

## DevNet Online Resources

DevNet is the starting point for all Cisco APIs: API documentation, education, and developer support. The starting page is **developer.cisco.com**.

- The site is organized by offering: **Start Now, Learning Tracks, Video Course, Sandbox, Code Exchange, and Ecosystem Exchange**.
- You can also browse by platform: IoT, Cloud, Networking, Data Center, Security, Mobility, Open Source, Collaboration, and Services.
- Or follow links for application developers, infrastructure developers, or network engineers.

### Learning Labs

- Tutorials on engineering technologies, programming languages, and concepts such as **model-driven programmability, REST APIs, Python, JavaScript**, and Cisco platforms.
- Often the best walk-through for using a DevNet Sandbox.
- Also explain how to set up your own development environment to practice locally.
- Categories mirror the site: coding, collaboration, IoT, data center, mobility (mobile and wireless), and networking.
- **Tracks** contain **Modules**, and Modules contain **Labs**. Requires a DevNet account and internet connection (developer.cisco.com/learning).

### DevNet Sandbox

- **DevNet Sandbox:** a pre-configured test bed, already installed with Cisco platforms, where you try out code in a realistic environment **without affecting production systems**.
- Sandboxes are either **Always-on** or **Reservation only**.

### DevNet Exchanges

**Exchanges** are DevNet's ways for community members to share with each other, aimed at both developers and business experts.

| Exchange | Purpose |
|---|---|
| **Automation Exchange** | A collection of network automation use cases with different solutions and toolkits. |
| **Code Exchange** | A curated, searchable subset of GitHub repositories. Anyone can submit a useful repo; it uses the GitHub API plus human moderators to categorize them. |
| **Ecosystem Exchange** | Connects partners and solution providers. Over 1,500 solutions across technologies, industries, and geographies. |

- A typical automation lifecycle: put devices into an operational state, apply configurations, then optimize. Monitor and troubleshoot when something goes wrong.
- Automation Exchange use cases range from listing data, to adding configurations, to activating policies across domains, users, or devices.
- Listings cover tool sets such as **Ansible or Puppet**, and scenarios from campus or branch, to data center, to service provider.

### DevNet Developer Support

Start at **developer.cisco.com/support**. DevNet helps troubleshoot integrations, API connections, and other developer use cases on Cisco products.

You can get support by:

- logging a ticket
- posting to a community forum
- accessing a Webex Teams space

There is also a knowledge base of troubleshooting articles.

- **Support case (ticket):** one-on-one support for members of the **Solution Partner program**, with a response time of **one business day**.
- **Forums:** the Cisco Developer Community (developer.cisco.com/support, then Community).

**Lab: Explore DevNet Resources**

1. Find and Navigate a Learning Lab
2. Explore More Resources

### DevNet Events

- **DevNet Create:** a conference on programmable infrastructure innovations and APIs.
- **DevNet Express:** events organized by local Cisco partners and Cisco offices.
- **DevNet Zone:** part of the **Cisco Live** conferences.

## DEVASC Project

A team project of five activities, documented in the **DEVASC Project Rubrics** (items marked "Rubric/Deliverable").

1. Forming teams to work collaboratively on the project.
2. Creating an Agile team.
3. Using version control software to collaborate as a team to develop an application.
4. Using DevOps methodology to add features to your application.
5. Creating an automated process that employs network programmability and automation.

**21st Century Skills:** learning how to learn, plus Creativity and Innovation, Critical Thinking and Problem Solving, Communication, and Collaboration.

### Project Activity 1: Team Formation

Tasks: choose a facilitator and a recorder, do an ice-breaker, discuss effective teamwork, and choose a role for each member.

- **Facilitator:** makes sure everyone gets to speak and no one dominates the discussion.
- **Recorder:** takes notes and summarizes the process in the rubric.

Attitudes shared by successful teams:

- Willingness to help each other
- Sharing a common vision
- Positive attitudes
- Support and encouragement
- Consensus building
- Open communications
- Effective conflict resolution

Rubric/Deliverables: team name; team members, interests and skillsets; answers to ice-breaker questions.

# Module 3: Software Development and Design

**Module objective:** Use software development and design best practices.

| Topic | Objective |
|---|---|
| **Software Development** | Compare software development methodologies. |
| **Software Design Patterns** | Describe the benefits of various software design patterns. |
| **Version Control Systems** | Implement software version control using GIT. |
| **Coding Basics** | Explain coding best practices. |
| **Code Review and Testing** | Use Python Unit Test to evaluate code. |
| **Understanding Data Formats** | Use Python to parse different messaging and data formats. |

## Software Development Life Cycle (SDLC)

**SDLC:** the process of developing software, from an idea to delivery. It is more than coding: it includes gathering requirements, creating a proof of concept, testing, and fixing bugs. Each phase takes input from the results of the previous phase.

There is no standard SDLC, but the six most common phases are:

1. Requirements & Analysis
2. Design
3. Implementation
4. Testing
5. Deployment
6. Maintenance

> **Key line:** The SDLC is "a description, not a prescription". Phases can be repeated, reordered, or run in parallel at many levels.

| Phase | Input | What happens | Output |
|---|---|---|---|
| **Requirements & Analysis** | Stakeholder needs | Explore stakeholders' situation, needs, constraints, and infrastructure; then features and UX; then architecture options. | **Software Requirement Specification (SRS)** |
| **Design** | SRS | Architects and developers design the software. | **High-Level Design (HLD)** and **Low-Level Design (LLD)** |
| **Implementation** | HLD and LLD | Coding/development. The **longest phase**. Test engineers write the **test plan** at the same time. | Functional code ready for testing |
| **Testing** | Code | Test engineers install the code in a test environment and follow the test plan. Bugs go back to developers until all tests pass. | Software ready for production (in theory) |
| **Deployment** | Tested software | Software is installed into production. The product manager decides with architects and engineers if it is ready to release. | Release to customers |
| **Maintenance** | Released software | Support customers, fix production bugs, improve the software, gather new requests. | Back to Requirements & Analysis for the next version |

### Requirements & Analysis questions

After gathering requirements, the team analyzes:

- Is it possible to develop the software according to these requirements, and can it be done on-budget?
- Are there any risks to the development schedule, and if so, what are they?
- How will the software be tested?
- When and how will the software be delivered?

### HLD vs LLD

- **HLD:** a "10,000-foot view": general architecture, components and their relationships.
- **LLD:** based on the HLD. Much more detail: architecture of individual components, the protocols between them, and required classes.

### Testing phase

Besides functional testing, test engineers also do **integration testing, performance testing, and security testing**.

- **Test plan:** a document listing every test needed to cover all features and functionality in the customer requirements.
- Software is never bug-free. It must be made **observable**, tested in production, and **resilient**.

## Development Methodologies

A **software development methodology** (also called an **SDLC model**) is a set of rules, steps, roles and principles. The three most popular are **Waterfall, Agile, and Lean**. The choice depends on project type, project length, and team size.

| | Waterfall | Agile | Lean |
|---|---|---|---|
| **Idea** | One long pass through the SDLC | Many quick iterations (sprints) | Minimize waste, maximize customer value |
| **Flexibility** | Can never go backwards | Welcomes change, even late | Decide as late as possible |
| **Focus** | Up-front planning and documentation | Customer and working software | Deliver only what customers want |

### Waterfall

- The traditional model, still practiced today. Nearly identical to the SDLC, since each phase depends on the previous one.
- Flows in **one direction only**, like a relay race baton.
- Original model credited to **Winston W. Royce**, with seven phases: **System requirements, Software requirements, Analysis, Program Design, Coding, Testing, Operations**.
- Each phase is documented as input for the next. One wrong decision can derail the whole iteration.
- New requirements cannot be added until the **next** iteration, which is costly and slow.

### Agile

The **Agile Manifesto** (Manifesto for Agile Software Development) was written in **2001** by **seventeen** software developers.

The four Agile values:

| Value | Over |
|---|---|
| Individuals and interactions | processes and tools |
| Working software | comprehensive documentation |
| Customer collaboration | contract negotiation |
| Responding to change | following a plan |

The twelve principles:

1. **Customer focus:** satisfy the customer through early and continuous delivery of valuable software.
2. **Embrace change and adapt:** welcome changing requirements, even late in development.
3. **Frequent delivery of working software:** every couple of weeks to a couple of months, preferring shorter.
4. **Collaboration:** business people and developers work together daily.
5. **Motivated teams:** give motivated individuals the environment and support they need, and trust them.
6. **Face-to-face conversations:** the most efficient and effective way to convey information.
7. **Working software:** the primary measure of progress.
8. **Work at a sustainable pace:** sponsors, developers, and users can keep a constant pace indefinitely.
9. **Agile environment:** continuous attention to technical excellence and good design.
10. **Simplicity:** the art of maximizing the amount of work *not* done.
11. **Self-organizing teams:** the best architectures, requirements, and designs come from them.
12. **Continuous Improvement:** the team regularly reflects and adjusts its behavior.

### Agile methods

| Method | Key idea |
|---|---|
| **Agile Scrum** | Named after the rugby scrum. Small, self-organizing teams meet daily for short periods and work in iterative **sprints**. The most popular. |
| **Lean** | Based on Lean Manufacturing. Eliminates wasted effort in planning and execution, and reduces programmer cognitive load. |
| **Extreme Programming (XP)** | More prescriptive than Scrum about engineering best practices and team quality-of-life issues. |
| **Feature-Driven Development (FDD)** | Development proceeds from an overall model, then is planned, designed, and built **feature-by-feature**, with detailed roles. |

### Scrum terms

- **Sprint:** a time-boxed iteration, usually **two to four weeks** (as short as possible). Duration is set before starting and rarely changes. At the end, software must be **deliverable** (but is not always released).
- **Backlog:** a **prioritized list of all features**, created by the **product owner**. Features come from Requirements & Analysis. The product owner can reprioritize it based on customer feedback.
- **User story:** a simple statement of what a user (or role) needs, and why. It must fit in a **single sprint**; if not, break it down further. Completing one requires all SDLC phases.
- **Scrum team:** cross-functional, collaborative, self-managed and self-empowered. Ideally **no larger than 10** people.
- **Daily standup:** max **15 minutes**, same time every day. Each member shares what they did, what they will do, and any obstacles. Facilitated by the **scrum master**, who helps remove obstacles.

User story template:

```
As a <user|role>, I would like to <action>, so that <value|benefit>
```

### Lean

Lean Software Development is based on Lean Manufacturing: **minimize waste, maximize value to the customer**. The seven principles (from the book *Lean Software Development: An Agile Toolkit*):

1. **Eliminate waste:** the most fundamental principle; all others follow from it. Waste is anything that does not add value for the customer.
2. **Amplify learning:** short sprints mean developers learn faster, customers give feedback sooner, and features can be adjusted.
3. **Decide as late as possible:** base decisions on facts, not speculation. Build flexibly until the decision is made.
4. **Deliver as fast as possible:** enables feedback and learning, gives customers what they need now, doesn't let them change their mind, speeds decisions, produces less waste.
5. **Empower the team:** let each expert decide in their own area.
6. **Build integrity in:** software addresses exactly what the customer needs, and stays useful.
7. **Optimize the whole:** experts must see the big picture so the software is cohesive.

The seven wastes of software development:

| Waste | Why it's waste |
|---|---|
| **Partially Done Work** | Adds no customer value, uses resources, and usually becomes obsolete. |
| **Extra Processes** | Like paperwork; wasteful for the same reasons. |
| **Extra Features** | If the customer didn't ask for it, it doesn't bring them value. |
| **Task Switching** | Time to refocus is lost. Assigning a person to multiple projects is waste. |
| **Waiting** | Any delay: starting, staffing, getting requirements, approvals, answers, decisions, implementation, testing. |
| **Motion** | People walking to ask questions (plus switching time), and artifacts (documents/code) handed between people missing information. |
| **Defects** | Unnoticed bugs snowball into other features and reduce the software's value. |

**Lab: Explore Python Development Tools:** Python installation, PIP, Python virtual environments, and sharing your virtual environment.

## Software Design Patterns

**Software design patterns:** best-practice solutions for common software development problems. They are **language-independent**. Using proven patterns speeds up development, since no new proof of concept is needed.

- Pattern thinking started in architecture and urban planning (e.g. a bus stop and a hospital waiting room both implement "A PLACE TO WAIT").
- In **1994**, the **Gang of Four (GoF)** (Erich Gamma, Richard Helm, Ralph Johnson, and John Vlissides) published *Design Patterns: Elements of Reusable Object-Oriented Software*, listing **23 design patterns**.

Two core principles:

- **Program to an interface, not an implementation:** loosely couple logical layers with abstract interfaces, instead of tying mainline logic to specific implementations. Example: a "vehicle" interface with `start_engine()`, `stop_engine()`, `accelerate()`, `brake()`.
- **Favor object composition over class inheritance:** build classes from small shared pieces and interfaces, instead of inheriting a huge base class. Example: a penguin implements "penguinlike", sharing class "swim" but not "fly".

The three GoF categories:

| Category | Purpose |
|---|---|
| **Creational** | Guide, simplify, and abstract software object creation at scale. |
| **Structural** | Reliable ways of using objects and classes for different kinds of projects. |
| **Behavioral** | How objects communicate and work together. |

### Observer pattern (Behavioral)

**Observer:** a subscription notification design. **Observers (subscribers)** receive events when an object they observe, the **subject (publisher)**, changes. Example: following users on social media.

To implement it:

1. The subject stores a list of all its observers.
2. The subject has methods to add and remove observers.
3. All observers implement a **callback** that the publisher invokes, ideally through a standard interface.

How it runs:

1. An observer adds itself to the subject's list.
2. When the subject changes, it notifies every observer by invoking their callback with the data.
3. Each observer's callback executes to process the notification.
4. Steps 2 and 3 repeat on every change.
5. When done, the observer removes itself from the list.

**Benefit:** real-time data on change. Subscription always performs better than **polling**.

### Model-View-Controller (MVC)

Sometimes considered an **architectural** design pattern. Goal: simplify development of applications with graphical user interfaces (common in UIs and web apps). Each component communicates in **one direction**.

| Component | Role |
|---|---|
| **Model** | The application's data structure. Manages data, logic and rules. Gets input from the controller. |
| **View** | The visual representation of the data. One set of data can have many views. |
| **Controller** | The middleman. Takes user input and manipulates it into the format for the model or view. |

Flow: user input → controller manipulates data → model processes it → (via controller, in strict MVC) view → user sees updated data.

```
User --(user input)--> Controller --(manipulated data)--> Model
  ^                                                         |
  +----(display data)---- View <----(updated data)----------+
```

**Benefit:** components can be **built in parallel** and **reused**, since each only needs the other components' input/output interfaces.

## Version Control Systems

**Version control** (also revision control or source control): managing changes to a set of files to keep a history of those changes.

- **Repository (repo):** stores the master set of files and the change history.
- **Working copy:** an individual's personal copy of the files, where changes don't affect others.

Benefits:

- **Enables collaboration:** many people work at once without overwriting each other.
- **Accountability and visibility:** who changed what, when, and why.
- **Work in isolation:** build features without affecting existing software.
- **Safety:** revert files when a mistake is made.
- **Work anywhere:** any device can have a working copy.

### Three types

| Type | Model | How it works |
|---|---|---|
| **Local (LVCS)** | Local system | A simple database of changes, usually storing the **delta** between versions. Mainly for reverting. |
| **Centralized (CVCS)** | Server-client | The only copy of the repo is on a server. Users **checkout** a file (locking it, so only one person edits it), then **checkin** (applies changes, tags a version, unlocks). |
| **Distributed (DVCS)** | Peer-to-peer | Everyone **clones** the full repo, including history. No locking; anyone can edit any file. Changes are **pushed** to a hosting service, which detects conflicts. Full copies on many systems can restore a corrupted repo. |

### Git

**Git:** an open source implementation of a **distributed** version control system, and the most popular VCS. It is easy to learn, handles projects of any size, is fast, collaborative, flexible, small, and free. Clients exist for MacOS, Windows, and Linux/Unix. Its focus is the **command line**.

> **Key line:** Git stores data as **snapshots**, not differences. If a file didn't change, Git stores a **reference link** to the previous snapshot.

**Three stages:**

- **Repository (.git directory):** the hidden `.git` folder created when a project becomes a repo. Holds metadata: compressed files, commits, and logs (commit history).
- **Working directory:** the visible folder; a copy of the repo's files. Changes here are only visible to that user.
- **Staging area:** what the user wants added/updated/deleted in the repo. Actually just an **index file** inside `.git`.

**Three states:**

- **Committed:** saved in the repository.
- **Modified:** changed, but not staged or committed.
- **Staged:** modified and ready to be committed.

### Local vs remote repositories

- **Local repository:** on the client machine's filesystem, where the git commands run.
- **Remote repository:** somewhere else (a server or hosting service). Optional; used for team collaboration.
- A remote repo still makes Git a **DVCS**, not a CVCS, because clones get the full repo without locking.
- After cloning, local and remote are independent until changes are applied with a manual Git command.

### Branching

**Branching:** working on code independently without affecting the main code. A new repo's code starts on a branch called **Master**.

Branches let you:

- Work on a feature independently while still using DVCS
- Work on multiple features concurrently
- Experiment with code ideas
- Keep production, development, and feature code separate
- Keep the main line of code stable

- Branches can be local or remote, and can be deleted. Merging back is not mandatory.
- Git branches are lightweight: just **pointers to a commit**. Switching is almost instant.
- Each branch has its own history, staging area, and working directory. The `.git` directory stays the same when switching.
- Best practice: use branches instead of updating master directly.

### GitHub and other providers

Git and GitHub are not the same. **Git** is the DVCS with a CLI. **GitHub** is a repository hosting service using Git, provided by **Microsoft**.

- Extra GitHub features: **code review, documentation, project management, bug tracking, feature requests**.
- **Pull request:** a formal request for a contributor's branch changes to be reviewed for inclusion in the main (or another curated) branch. Now used by all Git hosts.
- Other Git hosting services: **GitLab** and **Bitbucket**.

## Git Commands

| Command | Purpose |
|---|---|
| `git config --global key value` | Set global settings (writes to `~/.gitconfig`). |
| `git init <project directory>` | Create a new repo or make an existing folder a repo. Creates `.git` and the master branch. Files are not tracked automatically. |
| `git clone <repository> [target directory]` | Copy a full existing repo (with history and remote-tracking branches). |
| `git status` | List differences between the working directory and the parent branch, plus staged files. |
| `git diff` | Generic file comparison tool; files don't need to be tracked. |
| `git add` | Add files to the staging area. |
| `git rm` | Stage the removal of files. |
| `git commit` | Update the **local** repo with the staged changes. |
| `git push` | Update the **remote** repo with local commits. |
| `git pull` | Get updates from a remote branch or repo into the local copy. |
| `git branch` | List, create, or delete branches. |
| `git checkout` | Switch branches by updating the working directory. |
| `git merge` | Join two or more branches together. |

### Setup

Each installation must set the user's name and email for accountability:

```
$ git config --global user.name "<user's name>"
$ git config --global user.email "<user's email>"
```

### Clone

`git clone` supports four transport protocols: **Local, Secure Shell (SSH), Git, and HTTP**. Without a target directory, it clones into the current location. It:

1. Creates the working directory (named after the repo, or the given name).
2. Creates a `.git` directory inside it.
3. Copies the repo's metadata into `.git`.
4. Creates a working copy of the latest project files.
5. Duplicates the branch structure and checks out a local active branch.

### Status

`git status` compares against the **last commit the local clone copied**, not necessarily the latest remote version. It also shows:

- Current branch of the working directory
- How many commits it is behind the parent branch
- How to update the local repo and how to stage/unstage files

### Diff

```
$ git diff <file path>                               # working dir vs last commit
$ git diff <commit id> <file path>                   # working dir vs a commit
$ git diff <commit id 1> <commit id 2> <file path>   # two commits
$ git diff <file path 1> <file path 2>               # two files on disk
```

### Add and remove

```
$ git add <file path>                         # one file
$ git add <file path 1> ... <file path n>     # several (wildcards allowed)
$ git add .                                   # all changed files
```

- `git add` can be run many times before a commit. Staging is the first step of the two-step update.

Removing files, option 1:

```
$ git rm <file path 1> ... <file path n>            # delete from working dir and stage removal
$ git rm --cached <file path 1> ... <file path n>   # stage removal but keep the file
```

- `git rm --cached` fails if the file is already staged with changes.

Option 2 (same as `git rm`, the file is not preserved):

```
$ rm <file path 1> ... <file path n>
$ git add <file path 1> ... <file path n>
```

### Commit, push, pull

```
$ git commit
$ git commit -m "<message>"
```

- Combines everything staged into a single commit in the **local** repo. The remote is not changed.
- With nothing staged, Git returns a message and nothing happens. It never takes changes straight from the working directory.

```
$ git push origin <branch name>
$ git push origin master
```

- Fails if there is a **conflict** (two people edited the same part of the same file). Resolve conflicts first.

```
$ git pull
$ git pull origin
$ git pull origin <branch>
```

What `git pull` does:

1. Updates the local repo (`.git`) with the latest commits and history from the remote. (Equivalent to **git fetch**.)
2. Updates the working directory and branch with that content. (Equivalent to **git merge**.)
3. Creates a single commit on the local branch with those changes. Merge conflicts must be resolved.
4. Updates the working directory with the latest content.

### Branches

Option 1, create without switching (then use `git switch <branch name>`):

```
$ git branch <parent branch> <branch name>
```

Option 2, create and switch:

```
$ git checkout -b <parent branch> <branch name>
```

Delete and list:

```
$ git branch -d <branch name>
$ git branch
$ git branch --list
```

### Merging

Merging applies the commits of the **source** branch to the **target** branch. Only the target changes.

- **Fast-forward merge:** Git applies the source commits to the target automatically, without conflicts. Usually when different files (or different lines) changed. Git just moves the target branch's HEAD pointer instead of adding a new commit. The best case.
- **Merge conflict:** the same file was modified on both branches and Git can't combine them. The user fixes it manually, which adds a new commit to the target branch.

```
$ git merge <branch name>                    # merge into the current branch
$ git checkout <target branch name>          # merge into another branch
$ git merge <source branch name>
$ git merge <branch name 1>...<branch name n>    # octopus merge
```

- **Octopus merge:** merging more than one branch into the current branch at once.

### .diff files

A **.diff** file shows how two versions of a file differ. Some projects require changes submitted as a **patch** in a .diff file. Because it's all in one file, it's called a **unified diff**.

| Symbol | Meaning |
|---|---|
| `+` | Line was added. |
| `-` | Line was removed. |
| `/dev/null` | A file was added or removed. |
| (blank) | Context lines around the changed lines. |
| `@@` | Start of the next block of changes. A file can have several. |
| `index` | The commits being compared. |

- By default there are **three context lines** above and below each change.
- Add **.diff** to a GitHub pull request URL to see it as a unified diff.

```
diff --git a/check-network.yml b/check-network.yml
index 09b4f0c..b1978ca 100644
--- a/check-network.yml
+++ b/check-network.yml
@@ -4,7 +4,7 @@
   vars:
-    snapshot_file: "{{ inventory_hostname }}_bgp.json"
+    snapshot_file: "{{ inventory_hostname }}_routes.json"
```

**Lab: Software Version Control with Git:** initializing Git, staging and committing, tracking changes, branches and merging, handling merge conflicts, integrating Git with GitHub.

## Coding Basics

### Clean code

**Clean code:** code that is easy for other developers to read and understand. Common principles:

- Neat formatting that follows the language's conventions or the team "stylebook": ALL tabs or ALL spaces, the same indentation per level (required in Python), correct indentation, consistent brace placement.
- Intuitive names for variables and objects.
- Sensible organization (e.g. declarations grouped, functions up top, mainline code at the bottom).
- Appropriate comments.
- Every line serves a purpose; unused code removed.
- Reusable common code, and code that is easy to unit test.

Clean code emphasizes standardized formatting and intuitive naming, overall organization, **modularity** (for testing and reuse), comments, and being **self-documenting**.

- Code that isn't clean becomes **technical debt**: it needs refactoring or rewriting, which is expensive.

Why write clean code:

1. Easier to understand, more compact, better organized, so fewer bugs.
2. Modular, so easier to test with automated unit testing frameworks.
3. Standardized, so easier to check with **linters** or tools like grep, awk, and sed.
4. It just looks nicer.

### Methods and functions

**Methods and functions:** blocks of code that perform tasks when executed. Encapsulate code when:

- It performs a **discrete task**, even if used only once (e.g. compare strings, read a file, parse data). Good for clarity, testability, and reuse.
- It is used **more than once**. If you're copying lines around, make it a function.

Key terms:

- **Parameters:** the variables a function is written to accept (its input).
- **Arguments:** the values passed in when calling it. They must match the expected data types.
- **Strongly typed languages** require parameter types to be declared. Specifying types is a good idea even when optional: clearer reuse and clearer errors.
- **Return statement:** `return` followed by a value or expression. Code after it is skipped. The caller may use the value, but doesn't have to.

```
def functionName(parameter1,...,parameterN):
  # You can use the parameters just like local variables
  ...blocks of code...
  someVariable = parameter1 * parameter2
  return someVariable

myVariable = functionName("argument1", 4, {"argument3":"3"})
```

Here the result is `"argument1argument1argument1argument1"`, since Python repeats strings with `*`.

The course example removes duplicate code by turning repeated circumference math into functions:

```
def circumference(radius):
  pi = 3.14
  circumferenceValue = pi * radius * 2
  return circumferenceValue

def printCircumference(radius):
  myCircumference = circumference(radius)
  print ("Circumference of a circle with a radius of " + str(radius) + " is " + str(myCircumference))

printCircumference(2)
printCircumference(5)
printCircumference(7)
```

> **Key line:** **Functions** are standalone code blocks. **Methods** are code blocks associated with an object (OOP), called with `[class instance].[method]`.

```
class Circle:
    def __init__(self, radius):
        self.radius = radius
    def circumference(self):
      pi = 3.14
      circumferenceValue = pi * self.radius * 2
      return circumferenceValue
    def printCircumference(self):
      myCircumference = self.circumference()
      print ("Circumference of a circle with a radius of " + str(self.radius) + " is " + str(myCircumference))

circle1 = Circle(2)
circle1.printCircumference()
```

### Modules

**Module:** an independent, self-contained, reusable chunk of code, packaged as a **single file**. It works on its own and typically provides an interface for other modules. It is essentially a **library** and **cannot be instantiated**.

- Divides large projects into parts that are easier to read and can be developed in parallel.

```
from circleModule import Circle

circle1 = Circle(2)
circle1.printCircumference()
```

### Classes

- OOP is based on **encapsulation, data abstraction, polymorphism, and inheritance**.
- **Class:** bundles data and functionality. Each class declaration defines a **new object type**.
- **Class methods:** functions defined inside a class.
- Classes can have **class variables** (shared by all objects) and **object variables**.
- New classes can **inherit** properties, data members, and methods from existing ones.
- Objects are **instantiated** when first used, not predeclared. A class can be instantiated many times, each with its own data.
- Outside the class, use dot notation: `[class instance].[method name]`.
- Python has **no true private** variables or methods. By convention, a single leading underscore (`_name`) means private.

**Lab: Explore Python Classes:** review functions, methods, and classes; define a function; define a class with methods; review the `circleClass.py` script.

## Code Review

**Code review:** developers (**reviewers**) look over the codebase, a subset, or specific changes and give feedback. More than one reviewer is better, ideally people who understand the code's purpose. It happens **after** the changes are complete and tested. The author decides which comments to address, ideally with the reviewers' agreement.

Goal: final code that is easy to read, easy to understand, follows best practices, is correctly formatted, is free of bugs, has proper comments and documentation, and is clean.

Benefits: the author learns best practices and other styles; knowledge transfers between developers; code quality goes up.

Review process: code sent to reviewers → reviewers comment → comments sent to author → author fixes → fixed code sent back → reviewers either comment again or approve.

| Type | How it works | Notes |
|---|---|---|
| **Formal code review** | A series of meetings reviewing the whole codebase line by line. Details are documented. | Called **Fagan inspection**; common with **waterfall**. A single meeting on just the changes is a **walkthrough**. |
| **Change-based (tool-assisted)** | Reviews code changed for a bug, user story, feature, or commit, using a peer code review tool that highlights changes. | Started by the developer who made the change. Reviewers work independently; easy to see the actual changes. |
| **Over-the-shoulder** | A reviewer watches as the author walks through the changes line by line. | Direct discussion and quick fixes, but usually only one reviewer, so comments can be one-sided. |
| **Email pass-around** | Reviews follow the automatic emails a source code management system sends on checkin. | A single checkin may lack context for the whole change. |

## Testing

| Category | What it checks |
|---|---|
| **Functional testing** | Whether software works correctly, from **Unit Testing** up to **Integration Testing**. |
| **Non-functional testing** | Usability, performance, security, resiliency, compliance, localization, and more: whether the software is fit for purpose. |

- Non-functional testing doesn't only happen late. Some (e.g. checking whether a library meets a standard) must happen before the design is fixed.
- Agile builds a **Minimum Viable Product (MVP)** early, so both kinds of testing can start from the beginning.

### Unit testing

**Unit testing:** detailed functional testing of small pieces of code (lines, blocks, functions, classes) in isolation, usually automated with a framework that checks **assertions**.

```
a = 2 + 2
assert a == 4   # true
assert a == 5   # false, raises an error
```

`assert` is native to Python.

| Framework | Details |
|---|---|
| **unittest** | Included in Python by default. Tests are methods in a class that extends **TestCase**. |
| **PyTest** | Installed with `pip3 install pytest`. Runs unittest tests unchanged, but also lets tests be plain functions. Used by Cisco's **PyATS**. |

PyTest automatically runs scripts that start with `test_` or end with `_test.py`, and inside them, functions starting with `test_` or `tests_`.

```
# in file tests_mytest.py
import pytest
def add5(v):
    myval = v + 5
    return myval
def tests_add5():
    r = add5(1)
    assert r == 6
    r = add5(5)
    assert r == 10
    r = add5(10.102645)
    assert r == 15.102645
```

Run it with `pytest tests_mytest.py`.

The unittest version subclasses `unittest.TestCase` and uses `assertEqual`:

```
import unittest
def add5(v):
    myval = v + 5
    return myval
class tests_add5(unittest.TestCase):
    def test_add5(self):
        self.assertEqual(add5(1),6)
        self.assertEqual(add5(5),10)
        self.assertEqual(add5(10.102645),15.102645)
if __name__ == '__main__':
    unittest.main()
```

Run it with `python3 tests_mytest.py -v` (`-v` gives a verbose report).

- The `if __name__ == '__main__':` stanza enables command-line execution by calling `unittest.main()`.
- Add unit tests whenever you add something significant, and re-run them with every change. Tip: end a session with a deliberately broken test as a placeholder.

### Integration testing

**Integration testing:** comes after unit testing; makes sure the individual units fit together into a complete application.

- In unittest, **`setUp()`** and **`tearDown()`** come from TestCase, can be overridden, and run automatically before and after tests. In the PyTest example they are called manually.
- Run integration tests before starting work, after significant changes, and before finishing for the day. With **Continuous Integration**, errors must be fixed before anything else.

### Test-Driven Development (TDD)

**TDD** (also **Test-First Development**): write the **test code before the application code**, capturing requirements as tests, then write code until it passes.

The five-step repeating process:

1. Create a new test that captures a requirement.
2. Run tests; fix any that fail for unexpected reasons. (Expected failures, like testing a function that doesn't exist yet, are fine.)
3. Write application code to pass the new test, and nothing more.
4. Run tests; fix the application code if any fail.
5. Refactor and improve the code, re-running tests each time.

TDD makes developers think about requirements, keeps code simple, and forces highly testable code (e.g. pure functions).

**Lab: Create a Python Unit Test:** explore options in the unittest framework and test a Python function with unittest.

## Data Formats

The three most popular formats for exchanging information with remote APIs are **XML, JSON, and YAML**.

- **YAML** is a **superset of JSON**: any legal JSON can be converted to YAML (and mostly vice versa).
- **XML** is older, harder to parse, and not always convertible, but its tools are mature.

Common REST API pattern:

1. Authenticate, usually by **POST**ing a user/password and getting back an expiring **token**.
2. **GET** a resource's state from an endpoint, requesting XML, JSON, or YAML.
3. Modify the returned data.
4. **POST** (or **PUT**) to the same endpoint to change the resource's state.

| | XML | JSON | YAML |
|---|---|---|---|
| **Full name** | Extensible Markup Language | JavaScript Object Notation | YAML Ain't Markup Language |
| **Extension** | .xml | .json | (.yaml / .yml) |
| **Structure** | Symmetrical tags | Braces and brackets | Indentation |
| **Comments** | `<!-- -->` | **None** | `# comment` |
| **Whitespace** | Not significant | **Not significant** | **Significant** (spaces, not tabs) |

### XML

**XML:** a derivative of **SGML** (Structured, Generalized Markup Language) and the parent of **HTML**. Wraps text data in symmetrical tags to indicate meaning.

```
<?xml version="1.0" encoding="UTF-8"?>
<!-- Instance list -->
<vms>
  <vm>
    <vmid>0101af9811012</vmid>
    <type>t1.nano</type>
  </vm>
  <vm>
    <vmid>0102bg8908023</vmid>
    <type>t1.micro</type>
  </vm>
</vms>
```

- **Prologue:** the first line, bracketed by `<?` and `?>`. Holds the xml tag with version (normally "1.0") and encoding (usually "UTF-8", otherwise "UTF-16").
- **Body:** everything after the prologue (and comments). Always wrapped in one outermost **root tag pair** (here `<vms>`). Structured like a tree: root, branches, then **leaf nodes** holding data.
- **Tag names are user-defined.** For APIs, they're documented by the provider, often from a public namespace schema.
- **Special characters:** `<` and `>` can't appear in data. Without a schema, use HTML entities (`&lt;` and `&gt;`). With a schema (e.g. **NETCONF**), HTML entities aren't allowed; use numeric codes (`&#60;` and `&#62;`).
- **CDATA block:** includes a raw string without converting characters, e.g. `<![CDATA[ ... ]]>`.
- **Comments:** same as HTML, `<!-- comment -->`.

Attributes can replace child elements:

```
<vms>
  <vm vmid="0101af9811012" type="t1.nano" />
  <vm vmid="0102bg8908023" type="t1.micro"/>
</vms>
```

- Attribute values must be in single or double quotes.
- An element can have many attributes, but only one of each name.
- An element with no content can self-close (slash inside the open tag).

**Namespaces:** referenced with the `xmlns` attribute and identified by **Uniform Resource Names (URNs)**. Example: a NETCONF 1.0 RPC asking a device to kill a session:

```
<rpc message-id="101" xmlns="urn:ietf:params:xml:ns:netconf:base:1.0">
  <kill-session>
    <session-id>4</session-id>
  </kill-session>
</rpc>
```

- XML has **no way to say "this is a list"**, so converting it to Python means interpreting the writer's intent. JSON and YAML map directly to common data types.

### JSON

**JSON:** derived from how object literals are written in JavaScript (similar to Python). Files end in **.json**.

```
{
  "edit-config":
  {
    "default-operation": "merge",
    "test-operation": "set",
    "some-integers": [2,3,5,7,9],
    "a-boolean": true,
    "more-numbers": [2.25E+2,-1.0735],
  }
}
```

- **Basic data types:** numbers (integers, floats, scientific notation), strings, Booleans (`true`/`false`), and nulls.
- **Objects:** key/value pairs in braces: `{"keyname": "value"}`. Strings are quoted; numbers and Booleans are not.
- Multiple key/value pairs separated by commas act like **Python dictionaries**. Objects can be deeply nested.
- **Arrays (lists):** ordered values in square brackets.
- **No comments** in JSON.
- **Whitespace is insignificant**, so JSON is compact and survives copy-paste.

### YAML

**YAML:** a superset of JSON designed for easier human reading. Common for configuration files and automation templates (e.g. **Ansible**). YAML parsers can parse JSON, but not the other way round. JSON can be embedded in YAML directly; in JSON, quotes must be escaped (`\"`).

The JSON example above, in YAML:

```
---
edit-config:
  a-boolean: true
  default-operation: merge
  more-numbers:
  - 225.0
  - -1.0735
  some-integers:
  - 2
  - 3
  - 5
  - 7
  - 9
  test-operation: set
...
```

- **File structure:** starts with `---` and ends with `...`, each alone on a line. `---` also separates multiple documents in one file.
- **Data types:** same as JSON. Strings are usually unquoted; quote them only if they contain characters meaningful in YAML. In double quotes, backslash escapes like `\n` work.
- **Keys:** a colon separates key and value. Keys are usually unquoted (quote them if they contain colons).
- **Indentation** defines hierarchy. Any amount works, but best practice is **two spaces**. Be consistent and use **spaces, not tabs**.

```
my_integer: 2
my_float: 2.1
my_exponent: 2e+5
'my_complex:key' : "my quoted string value\n"
my_boolean: true
my_null: null
```

Maps and lists, block and flow syntax:

```
mymap:
  myfirstkey: 5
  mysecondkey: The quick brown fox
mylist:
  - 1
  - 2
  - 3

mymap: { myfirstkey: 5, mysecondkey: The quick brown fox}
mylist: [1, 2, 3]
```

Long strings:

```
mylongstring: >
  This is my long string
  which will end up with no linebreaks in it
myotherlongstring: |
  This is my other long string
  which will end up with linebreaks as in the original
```

- `>` is the **folding** syntax (line breaks become spaces). `|` keeps line breaks.
- **Comments:** `# ` anywhere except inside a long string literal.
- YAML 1.2 supports schemas and tags, e.g. `!!str 0.1415` forces a string (the "Failsafe" schema).

### Parsing and serializing

- **Parsing:** analyzing a message (a string of characters), breaking it into parts, and converting it into an equivalent data structure with recognized types.
- **Serializing:** roughly the opposite: turning local data (e.g. a Python dictionary) into a JSON, YAML, or XML string to send to a remote resource.

Course example: serialize an auth dictionary to XML with **dicttoxml**, send it with **requests**, then parse the XML reply with **untangle**:

```
import dicttoxml    # serialization library
import requests     # http request library
xmlstring = dicttoxml(auth)
myresponse = requests.get(get_services_query,auth=xmlstring)

import untangle     # xml parser library
myreponse_python = untangle.parse(myresponse)
print myreponse_python.services.service[1].name.cdata,myreponse_python.services.service[1].status.cdata
```

- `.cdata` gets the text content of an XML leaf node. The example prints `Service B  Idle`.

**Lab: Parse Different Data Types with Python:** parse XML, JSON, and YAML in Python.

## Project Activity 2: Agile Team Formation

Tasks: choose a project, build an agile team, assign roles, and pick communication channels.

Scenario: a junior automation engineer's growing team must move their Python automation code from individual computers to **GitHub** and collaborate there.

- **Scrum leader:** the course's replacement for "scrum master" (following an IETF Internet-Draft on avoiding oppressive terminology such as "master-slave"). Obtains resources and leads in resolving problems.
- **Recorder:** maintains the DEVASC Project Rubrics and records meeting days and times. In teams of fewer than four, the scrum leader may also be recorder.

Scrum leader responsibilities:

1. Clearing any obstacles or problems.
2. Establishing an environment where the team works and communicates effectively.
3. Addressing team dynamics so members support each other.
4. Protecting the team from outside interruptions; acting as intermediary between the team and the project owner (instructor).
5. Ensuring the rubric information is documented.

Roles vary with team size, the nature of the task, and company best practices and policies.

Rubric/Deliverables: scrum leader information, other Agile roles if any, and the team's communication tools and the purpose of each.
