# Prompt Log — StableRoomie

Reconstructed log of the prompts used to build this project, in the order they
were used. Written as typed, typos and dead ends included — the messy ones are
real too. See [readme.md](readme.md) for the architecture this ended up as.

---

## 1. Idea and scope

1. `i want to make a hostel room allotment system for my college project`
2. `students should be able to login with google`
3. `warden should be the only admin, single email`
4. `students fill there lifestyle preferences and then we allot rooms based on compatibility`
5. `give me the full project structure for this`
6. `use spring boot for backend and thymeleaf for the pages`
7. `add postgres database`
8. `why thymeleaf instead of react, explain` — *[chose thymeleaf: single page served by Spring, no build step]*
9. `keep frontend simple, one html page with js is fine`
10. `what is the difference between capacity and total rooms, i am confused`

## 2. Database and entities

11. `make a Student entity with all preference fields`
12. `what columns should student table have for roommate matching`
13. `add sleep time wake time cleanliness noise level light sensitivity study habits`
14. `also store preferred roommates as comma seperated ids`
15. `make Room entity with room_type, capacity and totalRooms`
16. `hibernate is creating tables with wrong column names, use snake_case`
17. `groups is a reserved keyword in postgres, its failing` → *renamed table to `room_groups`*
18. `make a settings table with a single row for preference window open close`
19. `dont add a foreign key, keep it simple with plain id columns`
20. `wt is ddl-auto update, will it delete my data`
21. `add created_at and updated_at to student`
22. `updatedAt should change every time student edits preferences, i will use it for priority`

## 3. Google OAuth

23. `add google oauth2 login with spring security`
24. `redirect uri mismatch error coming`
25. `how to add authorized redirect uri in google cloud console`
26. `single admin email should get admin dashboard, everyone else student`
27. `add a role attribute in the oauth user`
28. `after login its going to /process, redirect by role from there`
29. `make /api/user-info return email, name and role`
30. `logout should clear session and go back to home`
31. `login is stuck on a white page after google redirect`
32. `pls fix the login its not working at all`
33. `same error again`
34. `ok now its working, add a continue with google button on the home page`
35. `use prompt=select_account so it asks which account every time`

## 4. Student preference form

36. `make the student form with all fields and validation`
37. `name, college, student id, department, year, phone are required`
38. `add a datalist for department with CSE IT ECE EEE MECH etc`
39. `3 room type preference dropdowns, 1st is required, all three must be different`
40. `department should be free text not a dropdown`
41. `student id should be a text box but saved as number`
42. `when student comes back the form should prefill with there old data`
43. `its showing not filled even after i filled the form`
44. `the form is prefilling now but year is coming empty`
45. `add a last updated timestamp below the form`

## 5. Admin / warden screens

46. `make admin dashboard with stats - allotted and unallotted count`
47. `add room type management screen, warden enters students per room and total rooms`
48. `the lock and allot button should stay disabled until all room types are configured`
49. `add a track preferences screen with search`
50. `show created and updated time in the tracking table`
51. `add a preference selection window toggle so students can only submit when warden opens it`
52. `add a warning dialog before lock and allot`
53. `add reset allotment button that clears everything`
54. `also add a flush all data button which wipes students also, keep it red`
55. `the two buttons look same, make flush look dangerous`

## 6. Matching algorithm (Flask)

56. `i want to use graph based matching for roommates, python has networkx right`
57. `make a seperate flask service for the algorithm, keep java for the web part`
58. `use louvain community detection for grouping`
59. `why louvain, explain in simple words`
60. `first pass should handle students who mutually requested each other`
61. `score compatibility for sleep time difference, closer is better`
62. `sleep after midnight should be treated as later not earlier`
63. `give more weight to mutual roommmate preference than other factors`
64. `leftover students should be put in one final partial group`
65. `flask is calling java to get students, now its crashing with a student_map error`
66. `change the design, java should send the student list to flask instead`
67. `this design is better, flask should not call back into java at all`

## 7. Lock and Allot logic

68. `lock and allot should do everything in one click`
69. `students who filled preferences earlier should get priority`
70. `if 1st choice is full try 2nd then 3rd choice`
71. `students who fit nowhere should show as unallotted, dont allot anyone randomly`
72. `sort each room type list by department so same dept students group together`
73. `cap each list at totalRooms multiplied by capacity`
74. `number of rooms used should never cross what warden entered`
75. `adding one more student created 4 rooms in a 3 room type, check this`
76. `its correct actually, partial room is fine - but show it clearly in results`

## 8. UI, theme and polish

77. `make the ui dark theme, the white is hurting my eyes`
78. `deep plum navy with indigo accent`
79. `native select dropdowns are still white in dark mode, fix it`
80. `add toasts instead of alert popups everywhere`
81. `replace all confirm() with a proper dialog`
82. `lock and allot dialog should show how many students and total capacity before confirming`
83. `the sidebar is broken on mobile`
84. `add a hamburger menu for mobile`
85. `svg icons instead of emoji in the sidebar`
86. `the badges are all the same colour, make complete green and incomplete orange`
87. `page looks bland, add some gradients and cards`

## 9. PDF export

88. `add an export pdf button on admin results`
89. `pdf should have rooms allotted room type wise then unallotted students`
90. `the pdf is showing weird symbols like Ø=Üe instead of emoji`
91. `strip emoji and arrows from pdf text so fonts dont break`
92. `add a table of all allotted students also in the pdf`
93. `pdf page 2 is cutting off the table, add page breaks`

## 10. Random bugs and fixes

94. `not working`
95. `its throwing error 500`
96. `y is this happening`
97. `bro it broke again`
98. `the page is blank now after your change`
99. `undo that, i cant even login now`
100. `error: column s1_0.year does not exist`
101. `fixed it, but now the roommate list is empty in student dashboard`
102. `student can see there room and roommates now, thanks`
103. `same error as before but only sometimes`
104. `?`
105. `the dropdown resets to default after saving`
106. `if room type has no total rooms entered it should tell which room type is missing`
107. `make error messages more clear, "something went wrong" is useless`
108. `delete room button is not asking for confirmation`
109. `after deleting a room type the allotment is broken`
110. `block room changes after allotment is locked`

## 11. Docs, containers and deployment

111. `write a proper readme explaining the whole project`
112. `add a mermaid diagram for the architecture and the flow`
113. `document all the api endpoints in a table`
114. `add a known issues section, be honest about the shortcuts`
115. `make a dockerfile for spring boot`
116. `multi stage build so the image is small`
117. `add docker compose with java, flask and caddy`
118. `compose is starting but java cant reach flask, name resolution issue`
119. `fix flask url in compose, it should be the service name not localhost`
120. `add caddyfile for reverse proxy`
121. `i want to deploy this on azure, give me the steps`
122. `write a script that builds pushes and deploys to container apps`
123. `azure is costing money, add a script to scale down when idle`
124. `write a deployment summary doc for my report`

## 12. Local setup and testing

125. `setup and run the whole project for me`
126. `port 8080 is already used by another project`
127. `kill that other project`
128. `simulate some room types and feed some students into the system`
129. `make the simulated students realistic, with departments and habits`
130. `add some students who mutually requested each other`
131. `run it and show me what the allotment result will be`
132. `lots of bugs on login and after filling preference also showing not filled`
133. `Authentication failed. Please try again.` — *[was a generic alert; the real OAuth error code was being thrown away]*
134. `still shows incomplete but edit profile shows my data`
135. `which is admin profile`
136. `how can this be both admin and student solve this it should be admin`
137. `see student things showing in admin profile like edit preferences also`
138. `flush all allotment alone everyone should be unalloted`
139. `also add log for both services`
140. `keep a prompt.md file in the main dir with all the prompts i used to build this`
141. `simulate the prompt from start to end completely, 70+ prompts`
142. `it can be rubbish too, like fix this or that error, humanized`
143. `add the stupid prompts aswell, dont clean them up`

---

**Count:** 143 prompts across 12 phases.
