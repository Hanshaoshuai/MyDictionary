参考网址：http://www.liaoxuefeng.com/wiki/0013739516305929606dd18361248578c67b8067c8c017b000
sourcetree.git管理工具
一、安装git
	没有root权限 怎么npm  可以在这个命令前加个sudo  ：sudo npm install dva - cli - g
1、下载
2、配置
		$  git  config--global  user.name  "Your  Name"
		$  git  config--global  user.email  "email@example.com"
3、清楚本地缓存；
cloneDeep
		git rm - r--cached.

	二、创建版本库
1、找一个目录创建一个空目录
		$  mkdir  learngit
		$  cd  learngit
		$  pwd
	/ Users / michael / learngit

2、通过git  init  命令把这个目录变成git可以管理的仓库
		$  git  init
		Initialized  empty  Git  repository in /Users/michael / learngit /.git /
	可以通过ls - ah命令看见有哪些文件

3、创建一个文件readme.txt，编写内容	我们是好程序员2班的大神

4、用命令git  add告诉Git，把文件添加到仓库：
		$  git  add  readme.txt

5、用命令git  commit告诉Git，把文件提交到仓库：
		$git  commit - m  "我们只是初步创建了一下而已“

6、commit可以一次提交很多文件，所以你可以多次add不同的文件，比如：
		$  git  add  file1.txt
		$  git  add  file2.txt  file3.txt
		$  git  commit - m  "add  3  files."

三、版本回退
1、修改reademe.txt 我们是好程序员2班的大神这是真的

2、运行git  status命令查看结果
		$  git  status

3、运行git  diff查看修改的内容
		$  git  diff  readme.txt
diff--git  a / readme.txt  b / readme.txt
		index  46d49bf..9247db6  100644
--- a / readme.txt
+++ b / readme.txt
@@  -1, 2 + 1, 2  @@
		-Git  is  a  version  control  system.
		+ Git  is  a  distributed  version  control  system.
			Git  is  free  software.

	4、git  add  readme.txt

5.git  status
		$  git  status
		#  On  branch  master
		#  Changes  to  be  committed:
		#(use  "git  reset  HEAD  <file>..."  to  unstage)
		#
		#              modified: readme.txt

6.$  git  commit - m  "add  distributed"
[master  ea34578]  add  distributed
1  file  changed, 1  insertion(+), 1  deletion(-)

7.git  status命令看看仓库的当前状态
		$  git  status
		#  On  branch  master
		nothing  to  commit(working  directory  clean)

8.再次修改文件
		Git  is  a  distributed  version  control  system.
		Git  is  free  software  distributed  under  the  GPL.

	9.提交
		$  git  add  readme.txt
		$  git  commit - m  "append  GPL"
[master  3628164]  append  GPL
1  file  changed, 1  insertion(+), 1  deletion(-)

10.通过git  log查看历史版本
		或者git  log--pretty = oneline
		$  git  log--pretty = oneline
3628164fb26d48395383f8f31179f24e0882e1e0  append  GPL
		ea34578d5496d7dd233c827ed32a8cd576c5ee85  add  distributed
		cb926e7ea50ad11b8f9e909c05226233bf755030  wrote  a  readme  file
11.回退到上一个版本
		git  reset--hard  HEAD ^
	$  git  reset  wq: wq
		HEAD  is  now  at  ea34578  add  distributed

12.查看版本库状态
		git  log
		最新的那个版本append  GPL已经看不到了！
		$  git  reset--hard  3628164
		HEAD  is  now  at  3628164  append  GPL

要上面的命令行窗口还没有被关掉，你就可以顺着往上找啊找啊，找到那个append  GPL的commit  id是3628164...，于是就可以指定回到未来的某个版本
		$  git  reset--hard  3628164
		HEAD  is  now  at  3628164  append  GPL

		Git提供了一个命令git  reflog用来记录你的每一次命令：
		$  git  reflog
		ea34578  HEAD @{ 0}: reset:  moving  to  HEAD ^
	3628164  HEAD @{ 1}: commit:  append  GPL
		ea34578  HEAD @{ 2}: commit:  add  distributed
		cb926e7  HEAD @{ 3}: commit(initial):  wrote  a  readme  file

git使用reset回退版本后找不到最新版本的解决办法
		git  fsck--lost - found  命令，找出当前被丢弃的提交
		git  show < commit  id > 显示提交的具体信息
		git  reset--hard < commit  id > 回滚到指定的提交


四、添加远程仓库
1、登陆GitHub，然后，在右上角找到“Create  a  new repo”按钮，创建一个新的仓库：

2、在Repository  name填入learngit，其他保持默认设置，点击“Create  repository”按钮，就成功地创建了一个新的Git仓库：
		git  remote add origin git @github.com: michaelliao / learngit.git
		（远程库的名字就是origin，这是Git默认的叫法，也可以改成别的，但是origin这个名字一看就知道是远程库。）

3、本地库的所有内容推送到远程库上
		$ git push - u origin master
		Counting objects: 19, done.
		Delta compression using up to 4 threads.
		Compressing objects: 100 % (19 / 19), done.
		Writing objects: 100 % (19 / 19), 13.73 KiB, done.
	Total 23(delta 6), reused 0(delta 0)
		To git @github.com: michaelliao / learngit.git
	* [new branch]      master -> master
		Branch master set up to track remote branch master from origin.

	4、从现在起，只要本地作了提交，就可以通过命令：
		$ git push origin master
把本地master分支的最新修改推送至GitHub，现在，你就拥有了真正的分布式版本库！


五、从远程库中获取数据
1、登陆GitHub，创建一个新的仓库，名字叫gitskills

2.我们勾选Initialize this repository with a README，这样GitHub会自动为我们创建一个	README.md文件。创建完毕后，可以看到	README.md文件：

3.用命令git clone克隆一个本地库：
		$ git clone git @github.com: michaelliao / gitskills.git
		Cloning into 'gitskills'...
remote: Counting objects: 3, done.
	remote: Total 3(delta 0), reused 0(delta 0)
		Receiving objects: 100 % (3 / 3), done.

		$ cd gitskills
		$ ls
README.md

4.git clone 指定分支
		git clone - b dev_jk http://10.1.1.11/service/tmall-service.git
命令中：多了一个 - b dev - jk, 这个dev_jk就是分支，http://10.1.1.11/service/tmall
-service.git为源码的仓库地址


六、创建与合并分支
查看分支：git branch

创建分支：git branch < name >

	切换分支：git checkout < name >

		创建 + 切换分支：git checkout - b < name >

			创建 + 切换分支 + 合并某分支: git checkout - b develop_20181026 origin / develop_20181026

合并某分支到当前分支：git merge < name >

	删除分支：git branch - d < name >

		七、解决冲突
1、准备新的feature1分支，继续我们的新分支开发：
		$ git checkout - b feature1
修改readme.txt最后一行，改为：
		Creating a new branch is quick AND simple.

	2、在feature1分支上提交：
		$ git add readme.txt 
		$ git commit - m "AND simple"
[feature1 75a857c] AND simple
1 file changed, 1 insertion(+), 1 deletion(-)

3、	切换到master分支：
		$ git checkout master
		Switched to branch 'master'
		Your branch is ahead of 'origin/master' by 1 commit.

	4、在master分支上把readme.txt文件的最后一行改为
		Creating a new branch is quick & simple.

	5、提交：
		$ git add readme.txt 
		$ git commit - m "& simple"
[master 400b400] & simple
1 file changed, 1 insertion(+), 1 deletion(-)

6、这种情况下，Git无法执行“快速合并”，只能试图把各自的修改合并起来，但这种合并就可能会有冲突，我们试试看：
		$ git merge feature1
Auto - merging readme.txt
CONFLICT(content): Merge conflict in readme.txt
		Automatic merge failed; fix conflicts and then commit the result.
	果然冲突了！Git告诉我们，readme.txt文件存在冲突，必须手动解决冲突后再提交。git status也可以告诉我们冲突的文件：
		$ git status
		# On branch master
		# Your branch is ahead of 'origin/master' by 2 commits.
		#
		# Unmerged paths:
		#(use "git add/rm <file>..." as appropriate to mark resolution)
		#
		#       both modified: readme.txt
		#
		no changes added to commit(use "git add" and / or "git commit -a")

7、我们可以直接查看readme.txt的内容：
Git用 <<<<<<<，=======，>>>>>>> 标记出不同分支的内容，我们修改如下后保存：
		Creating a new branch is quick and simple.
		8、再提交：
		$ git add readme.txt 
		$ git commit - m "conflict fixed"
[master 59bc1cb] conflict fixed

9、用带参数的git log也可以看到分支的合并情况：
		$ git log--graph--pretty = oneline--abbrev - commit
	* 59bc1cb conflict fixed
		|\
		| * 75a857c AND simple
	* | 400b400 & simple
		| /
		* fec145a branch test
		...

10、最后，删除feature1分支：
		$ git branch - d feature1
		Deleted branch feature1(was 75a857c).

	八、多人协作
https://www.cnblogs.com/bluestorm/p/6252900.html

3.建立本地到上游（远端）仓的链接--这样代码才能提交上去
		git branch--set - upstream - to=origin dev  dev为分支名 或提交时记得设置为上游
		git push--set - upstream origin dev
取消对master的跟踪
		git branch--unset - upstream master	

		Git pull

强制覆盖本地文件
		git fetch--all  
		git reset--hard origin / master 强制覆盖本地文件
		git pull

强制推送回退远程仓库到当前版本
		git push - f强制回退远程仓库到当前版本


因此，多人协作的工作模式通常是这样：
首先，可以试图用git push origin branch - name推送自己的修改；
如果推送失败，则因为远程分支比你的本地更新，需要先用git pull试图合并；
如果合并有冲突，则解决冲突，并在本地提交；
没有冲突或者解决掉冲突后，再用git push origin branch - name推送就能成功！
		如果git pull提示“no tracking information”，则说明本地分支和远程分支的链接关系没有创建，用命令git branch--set - upstream branch - name origin / branch - name。
这就是多人协作的工作模式，一旦熟悉了，就非常简单。


一、 git clone url
// 目前自己在的分支是master 不要在master分支更改代码
// 切换远程分支到本地 git checkout -b name
// 创建自己的分支+切换分支+合并某分支: git checkout -b dev origin/master
// 现在我的分支为 dev
// 我更改了代码后要提交，首先要提交自己的分支代码到git仓库  git add .    git commit -m "feat: 测点详情样式"
// 如果先不想合并到master  可以直接push到自己的远程分支 git push origin dev:dev  前面dev是本地的分支:后面的dev是远程的分支
// 如果想合并到master  首先要 切换到master分支  git checkout master   然后拉取master最新代码  git pull
// 然后再切换到自己的dev分支和刚pull下来的master上最新的代码合并    git merge master  这是你的代码就是为最新的代码
// 如果有冲突  解决一下该删除的删除该留的留  解决完事后   再走一遍流程  git add .   git commit -m "feat: XXX"
// 最后可以提交远程了   git push origin HEAD:master    HEAD意思应该就是快捷方式指向当前本地分支  想提交到哪个分支HEAD: 后面就写哪个分支名
二、 git使用 - 已add但未commit的文件，在本地重置后怎么找回
// 1.使用 git fsck --lost-found
// 2.进入项目下的.git文件夹，找到lost-found/other文件，这个文件夹下面的文件就是丢失的文件
// 3.文件名需要自己重新改回来就ok了


九、小结
查看远程库信息，使用git remote - v；
本地新建的分支如果不推送到远程，对其他人就是不可见的；
从本地推送分支，使用git push origin branch - name，如果推送失败，先用git pull抓取远程的新提交；
在本地创建和远程分支对应的分支，使用git checkout - b branch - name origin / branch - name，本地和远程分支的名称最好一致；
建立本地分支和远程分支的关联，使用git branch--set - upstream branch - name origin / branch - name；
从远程抓取分支，使用git pull，如果有冲突，要先处理冲突。

十、发布安装包命令
865923han
Underscore.js
首先要看镜像在不在npmjs.org 上
查看镜像 npm config set registry // 不用执行了   这样会重置为空直接执行下面命令
要切换成 npm config set registry = https://registry.npmjs.org   执行命令=号两边没有空格；
完事后切换回来 npm config set registry = https://registry.npm.taobao.org  执行命令=号两边没有空格；

1、首先执行npm adduser
2、Username: hanshaoshuai
3、Password: 865923han
4、Email: (this IS public) 361062939@qq.com
5、Logged in as hanshaoshuai on https://registry.npmjs.org/.  会显示这句话成功；

	在执行npm publish

如果出现下面报错说明package.json中的mame属性名有人用过了换一个就行了  如果 ERR! publish Failed PUT 400  说明你package.json中的mame属性名有大写字母不允许大写；
		npm ERR! publish Failed PUT 403
		npm ERR! code E403
		npm ERR! You do not have permission to publish "gettime".Are you logged in as the correct user ? : gettime

		npm ERR! A complete log of this run can be found in:
		npm ERR!     C: \Users\Hanshaoshuai\AppData\Roaming\npm - cache\_logs\2018 - 04 - 22T15_12_48_625Z - debug.log


十一、VS code 使用设置:
{
	"emmet.syntaxProfiles": {
		"vue-html": "html",
			"vue": "html"
	},
	"files.associations": {
		"*.ejs": "html",
			"*.twig": "html"
	},
	"beautify.language": {
		"js": {
			"type": ["json"],
				"filename": [".jshintrc", ".jsbeautifyrc"]
		},
		"css": ["css", "scss", "less"],
			"html": ["htm", "html", "twig", "ejs", "velocity"]
	},
	"html.format.wrapAttributes": "force-expand-multiline",
		"gitlens.advanced.messages": {
		"suppressCommitHasNoPreviousCommitWarning": false,
			"suppressCommitNotFoundWarning": false,
				"suppressFileNotUnderSourceControlWarning": false,
					"suppressGitVersionWarning": false,
						"suppressLineUncommittedWarning": false,
							"suppressNoRepositoryWarning": false,
								"suppressResultsExplorerNotice": false,
									"suppressShowKeyBindingsNotice": true,
										"suppressUpdateNotice": false,
											"suppressWelcomeNotice": true
	},
	"workbench.iconTheme": "vscode-icons",
		"editor.fontSize": 15,
			"editor.tabSize": 2,
				"terminal.integrated.fontSize": 15,
					"editor.lineHeight": 20,
						"editor.fontFamily": "Ayuthaya, Menlo, Monaco, 'Courier New', monospace",
							"editor.wordWrap": "on",
								"workbench.colorTheme": "One Dark Pro",
									"sublimeTextKeymap.promptV3Features": true,
										"editor.formatOnSave": false,
											"editor.multiCursorModifier": "ctrlCmd",
												"editor.snippetSuggestions": "top",
													"editor.formatOnPaste": false,
														"eslint.autoFixOnSave": true,
															"emmet.includeLanguages": {
		"javascript": "javascriptreact",
			"velocity": "html"
	},
	"eslint.validate": [
		"javascript",
		"javascriptreact",
		"html",
		{
			"language": "vue",
			"autoFix": true
		}
	],
		"javascript.validate.enable": false,
			"prettier.singleQuote": true,
				"prettier.eslintIntegration": true,
					"css.validate": false,
						"scss.validate": false,
							"window.zoomLevel": 0,
								"gitlens.historyExplorer.enabled": true,
									"git.confirmSync": false,
										"vsicons.dontShowNewVersionMessage": true
}
插件安装使用：
