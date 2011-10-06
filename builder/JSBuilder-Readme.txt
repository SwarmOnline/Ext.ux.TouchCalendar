JSBuilder2 is a JavaScript and CSS project build tool.
For additional information, see http://extjs.com/products/jsbuilder/

JSBuilder version 2.0.3

Available arguments:
    --projectFile -p    (REQUIRED) Location of a jsb2 project file
    --homeDir -d        (REQUIRED) Home directory to build the project to
    --verbose -v        (OPTIONAL) Output detailed information about what is being built
    --debugSuffix -s    (OPTIONAL) Suffix to append to JS debug targets, defaults to \'debug\'
    --help -h           (OPTIONAL) Prints this help display.        
    
Additional Contrib Options:  (these options are contributions not in the original 2.0.0 source.)");
    --sourceDir -f      (OPTIONAL) Overrides using the projectFile path as the source files path.
    --deployDir -n      (OPTIONAL) Overrides the deployDir (package name) setting in the .jsb2 file.
    --forceEncoding -e  (OPTIONAL) Convert text files to 'UTF-8', 'UTF-16LE', 'UTF-16BE', etc..., also strips BOMs
    --forceLineEnd -l   (OPTIONAL) Convert uncompressed CSS and JS files to 'unix' or 'windows'
    --stripComments -c  (OPTIONAL) Strip comments from debug versions of files
    --removeTempPkg -T  (OPTIONAL) Remove packages marked as temporary for final user deployment builds
    --removeFilter -F   (OPTIONAL) Remove files and folders designated by filter. Ex: -f pkg;test;welcome
    --deployMode -D     (OPTIONAL) Set common deploy options for deployment builds. -L -l -e -F are over-rideable
               Specifically: -l unix -e UTF-8 -L 1000 -c -C -I -T -F pkgs;src;test;welcome;docs;ext.jsb2;index.html

Additional YUI Options:  (these options are the same as the YUI compressor command line options)
    --yui-line-break -L            (OPTIONAL) defaults to -1, which is no line breaks
    --yui-verbose -V               (OPTIONAL) defaults to not verbose
    --yui-nomunge -M               (OPTIONAL) defaults to munge function variables
    --yui-preserve-semi -P         (OPTIONAL) defaults to not preserve simi-colons at end of line
    --yui-disable-optimizations -O (OPTIONAL) defaults to enabling micro optimizations
    --yui-compress-css -C          (OPTIONAL) defaults to not compress css
    --yui-collapse-license -I      (OPTIONAL) defaults to not consolidating licenses per file


Example Usage:

Windows
java -jar JSBuilder2.jar --projectFile C:\Apps\www\ext3svn\ext.jsb2 --homeDir C:\Apps\www\deploy\

Linux and OS X
java -jar JSBuilder2.jar --projectFile /home/aaron/www/trunk/ext.jsb2 --homeDir /home/aaron/www/deploy/


Notes about the additional non-Sencha contrib options:

1. Both --sourceDir and --deployDir are intended to allow additional control over the source and target
   paths, and provide a way to designate the path or name of the .jsb2 file separately, all without
   breaking the existing behavior if these options are not set.  If you set --sourceDir, then that
   directory used as the base source directory, rather than it being derived from the folder that
   the --projectFile is in.  If --sourceDir is set, then --projectFile is relative to the --sourceDir
   path, but can still be set to the full path of the .jsb2 file. The --deployDir option should really
   probably have been named '--packageName' or '--distName', as that is really what its doing, but is
   named to match the .jsb2 top level file option that it overrides.  These options are intended to
   make this more useful for those wishing to create deployable builds of Ext or other packages and to
   give more options for their code organization and layouts in their repositories, including not having
   to touch the original Ext distribution at all.
   
   For example:
     --projectFile ext.jsb2
     --sourceDir my/sencha/ext/dist/path
   would be equivalent to still being able to set something like,
     --projectFile  my/sencha/ext/dist/path/ext.jsb2
   but would now allow something like
     --projectFile my/source/build/files/ext.jsb2
     --sourceDir my/sencha/ext/dist/path
   OR 
     --projectFile ext-mine.jsb2
     --sourceDir my/sencha/ext/dist/path
   where the latter is a copy of the original ext.jsb2 file in the Sencha dist folder to customize.
 
   For --deployDir by default using just:
     --homeDir my/generated/build/dir
   you would end up with
     my/generated/build/dir/javascripts/ext-3.x
   but additionally supplying
     --deployDir ext-3.1.1
   you would now get
     my/generated/build/dir/javascripts/ext-3.1.1
   without having to touch the .jsb2 file.  This can very useful for many things including getting
   the name to match your deployment structure, and firing off multiple builds using the same file
   with different options, or using different sources or versions packaging to the same build
   location with different names.
 
2. For both --forceEncoding and --forceLineEnd, even without setting these options, a good deal of LE
   and Encoding matching are now happening in the background as of 2.0.2.  By default, with neither
   of these options specified, spliced files and header placements are matched for LE and Enc on a per
   source file basis. In all cases every attempt is made to propagate BOMs, LEs and detected encoding
   formats of the original top level file's format. This means Encoding and LE 'sanity' exists now in
   build files for JSBuild2, and is automatic. This allows support for a lot of situations, including
   multi-language support that would have been much harder before, and should makes this a much better
   universal builder, especially in heavy multi-dev environments. The default encoding support also
   protects the compression stages automatically, as both compressors are not BOM or encoding friendly,
   like non utf-8 filtered bytes cause them to crash.  Proper encodings needed by the compressors are
   propagated through them as appropriate. Both compressors will strip windows line endings to unix
   ones however the debug version of the file will retain the original propagated line endings. 
   
   If these options are enabled each stage of the build will reconcile the encodings, properly
   transcoded to the desired encoding format such that each output file will end up in the desired
   encoding and the compressor stage will attempt to compress with that designated encoding.
   
3. The --stripComments attempts to emulate the output of Sencha comment stripping, while adding proper
   comment stripping for CSS files.  Filtered files should now compare almost exactly and look much
   more like the non-comment Sencha distribution files.  This helps with performance on the browser for
   debugging and in saving distribution space, and not having the comments propagate if you are
   debugging production server.  However there are differences, such as string literal and JS pattern 
   matching escape detections where the JSBuilder2 tool does a better job than the default Sencha
   comment removal and will see longer strides of un-missed comments removed.  This option will remove
   comments without removing protected license headers comments.
   
4. The --yui-collapse-license is closely related to the comment stripping, however this deals with how
   license headers are treated for the debug files and the final compression stage. With this option
   enabled, subsequent headers after the top header will be set for removal by the compressor if they
   match the header supplied in the .jsb2 file. This option will compensate for encoding and WS
   differences such that the WS and encodings will not affect the matching, which saves from the issue
   that you can only set one header in the .jsb2 file even if your files have different encodings and
   inconsistent WS for the headers. Even if this option is not enabled, JSBuilder will no longer
   produce duplicate top headers for files any files it might have added a header to before. 

5. The --removeTempPkg and --removeFilter options allow using JSBuilder2 for more deployment type
   builds rather than the more distribution style builds it was producing, without having to be totally
   invasive in he .jsb2 file, and allows generating distribution builds with much less knowledge and
   time spent.  The --removeTempPkg will allow marking of packages in the .jsb2 file with 'keep: false'
   where the final file will be removed in the clean temp files stage of JSBuilder.  If the option is
   enabled then package files marked 'keep: false' will get cleaned. This may seem odd as to why write
   the file and then remove it, but packages can be dependent on each other during the build, and this 
   allows them to exist and be used correctly. The --removeFilter option allows a list of file and folder
   names to be cleaned after the build stage as well, where any named folder or file designated will be
   removed.  This option supports naming things in sub-folders such that 'examples/blah' would remove
   'blah' from 'examples'.  Again this allows normal people to be far less invasive in their .jsb2 files
   and still produce a fairly deploy-able build.
   
6. The --deployMode option is a convenience option that automatically sets options noted in the option
   syntax help above to assist with deployment builds. This allows for setting common and known safe
   deployment option settings, without having to become a Ext build engineer. Rationale is as follows,
   which will also help anyone reading this to understand the options in general better:  
   -l unix 	   - forcing the LE to unix makes smaller consistent builds for the debug files
   -e UTF-8    - most safe encoding in general situations and will ensure any stray chars are safe
   -L xxxx     - too many tools choke still, many have only 4k line buffers or less
   -c          - strip comments, safety, tool choke, and size, produces files similar to Sencha dist
   -C -I       - enables CSS compression and enables header collapse, size
   -T -F       - file deployment filters as described above, same reasons above
   
7. The --yui-compress-css option compresses target css files and there are a few important notes to make
   about this option.  The YUI Compressor was modified to properly handle top headers such that they are
   still formatted and human readable, which is legally more proper. Also the compressor will still only
   use the classic -L (--yui-line-break) option as the rest only apply to JS files really and there is no
   way to really do those optimizations on CSS anyway.  For the pre-compressor comment removal done by 
   JSBuilder, if enabled, CSS files are comment stripped as well but treated differently somewhat. CSS
   files of course do not have // style comments and any // comments are ignored while they are handled
   correctly for JS files, and string literal and escape detection is the same for both. Understanding
   that should help if you find any bugs. Also the YUI compressors were modified in this version to 
   additionally accept and retieve buffer input and output, rather than just streams, as both 
   compressors simply spool up a buffer or have a final buffer when complete anyway, rather than actually
   streaming any compression.  This with many other changes should nearly allow JSBuilder to be used
   directly in process in an appserver context on a live site.. *hint* *hint*.  Also the FileHelper
   class was made non-static to allow it to be used by multiple threads in the same process. All source
   is included in the JSBuild2jar.
   
8. Internal changes were made so that resources defined in the .jsb2 file would automaticaly create their
   dependant directories... such that you can now define something like:
      "src": "examples/ux/images/", "dest": "images/ux"
   and it will work.  Before, it would *only* create and copy top level directores if explicitly defined.   

9. There were many changes correctly fail at some of the stages on critial error and return proper
   error codes, to behave more like something that is a part of a build process, without hurting the
   little bit of infrastructure already in place that looks like it was intended to be used by Sencha
   for creating a build your own site.
   
10. Notes on using command line options as part of a buidl via a plain Ant example:

--- simple example ---
  Task like target, to be reused:

    <path id="jsbuilder.classpath">
        <fileset dir="${lib.java.dir}">
            <include name="sencha/JSBuilder2.jar" />
        </fileset>		
    </path>
    <target name="generate.js">
         <mkdir dir="${output}" />	
         <java classname="com.extjs.JSBuilder2" failonerror="true" fork="true">
             <classpath refid="jsbuilder.classpath"/>
             <sysproperty key="java.library.path" value="lib/"/>
             <arg line="--projectFile ${input}"/>
             <arg line="--homeDir ${output}"/>
             <arg line="-D"/>	     	
         </java>     
    </target>  
    
  Call Target (added elsewhere):
    
    <antcall target="generate.js">
        <param name="input" value="${src.dir}/ext-3.3.1/ext.jsb2"/>
        <param name="output" value="${build.dir}/generate"/>
        <param name="name" value="ext-3.3.1"/>
    </antcall>

--- more complex exmaple ---
  Task like target, to be reused:

    <path id="jsbuilder.classpath">
        <fileset dir="${lib.java.dir}">
            <include name="sencha/JSBuilder2.jar" />
        </fileset>		
    </path>
    <target name="generate.js">
         <mkdir dir="${output}" />	
         <java classname="com.extjs.JSBuilder2" failonerror="true" fork="true">
             <classpath refid="jsbuilder.classpath"/>
             <sysproperty key="java.library.path" value="lib/"/>
             <arg line="--projectFile ${input}"/>
	         <arg line="--sourceDir ${source}"/>
             <arg line="--homeDir ${output}"/>
             <arg line="--deployDir ${name}"/>
             <arg line="-D"/>	     	
             <!-- arg line="-L 500 -C -I"/ -->
             <!-- arg line="-D -F pkgs;src;test;welcome;docs;resources;examples;adapter;ext.jsb2;index.html"/ -->	     	
         </java>     
    </target>  
    
  Call Target (added elsewhere):
    
    <antcall target="generate.js">
        <param name="input" value="${src.dir}/conf/ext.jsb2"/>
        <param name="source" value="${lib.js.dir}/ext-3.3.1"/>
        <param name="output" value="${build.dir}/webapp/javascripts"/>
        <param name="name" value="ext-3.3.1"/>
    </antcall>
   
11. Notes on culling to smaller builds of Ext:

- Learn to love the Safari/Chrome WebKit based debugger... To test: rebuild, and with debugger
  and debug versions of files, watch for the break or error.  Then set the breakpoint on the 
  undefined error line, then reload the page.  When it breaks again, click the (program) line
  in the stack on the right, then you can see what the dependancy was, as Ext almost always
  dies nicley on JS load as each component will try to sub-class its dependant module.

- Eliminate form widgets first....  One easy way is to remove any UX you arn't using, then remove
  the form types. This kills a ton of dependancies up front.  When its working again go back and
  remove data dependances such as json array if you arnt using and such.  Its ok to remove css
  dependances too, many use same corresponding names as the packages you removed. CSS 'form' is
  for all css form widgets for 3.x so you will ususally have to keep it.

- Packages...  its easier to remove the packages from the ext-non-core package (after removing
  form widgets first), and then only from the packages left over remove includes.
  
  Easy removes:
    - direct package - if you arnt using the direct db editing, where does updates itself
    - any grid pivot - those are buried in base grid package but most not using it
    - any html, editor, or text area - if you arnt using those, they are expensive
    - chart, tree, etc... - if ofcourse you arn't using
    - if you are using mostly grids, you can remove form itself basic form and nerarly all
      of the form infrastructure
    - ...
    
- You can create your own top level ext package (replacing the word 'Mine') somewhere in
  the .jsb2 file, in the package section, that includes ux and base if you want and leave
  the original alone:
   {
		"name": "Ext Mine",
		"file": "ext-mine.js",
		"isDebug": true,
		"includeDeps": true,
		"pkgDeps": [
			"adapter/ext/ext-base.js",
			"pkgs/ext-core.js",
			"ext-all-no-core.js",
			"examples/ux/ux-all.js"
		],
		"fileIncludes": []
    }
   this will make it easier.. by far.. rather then confusing issues changing the default ext-all.js
   package and you can still load the ext-all versions as fallback with no ux or base.

   Similarly for css:
    {
       "name": "Ext Mine CSS",
       "file": "css/ext-mine.css",
       "fileIncludes": [],
       "includeDeps": true,
       "pkgDeps": [
           "resources/css/ext-all.css",
		   "examples/ux/css/ux-all.css"
       ]
     }
   Which would require that you put the images in a common place such as adding something
   like this to resources section:
    {
        "src": "examples/ux/images/",
        "dest": "images/",
        "filters": ".*[\\.html|\\.jpg|\\.png|\\.gif|\\.css|\\.js|\\.php]"
    },{
        "src": "resources/images/default/",
        "dest": "images/default/",
        "filters": ".*"
    }
   Then lastly mark ext-all-core ext-all-no-core packages with 
     'keep: false'
   so they are removed from the final deployment build after the build is complete.

   Then finally you could add a filter option such as:
     -D -F pkgs;src;test;welcome;docs;resources;examples;adapter;ext.jsb2;index.html 
   and you are done, which is better than the stock dist for deployments and far less
   time consuming then having to totaly hack to death the stock .jsb2, even if
   you removed no packages... 


12. This all should help regular devs more easily make use of the tool for doing
    tighter deployment builds. And hopfully enhance the usability in the wild, of
    the otherwise well done Ext product, and possibly set JSBuilder up for being more
    ubiquitous as a tool for putting it all together for minify and processing of
    client side code, and on more an even footing with server side code for builds.
    

JSBuilder uses the following libraries
--------------------------------------
YUI Compressor licensed under BSD License
http://developer.yahoo.com/yui/compressor/
http://developer.yahoo.com/yui/license.html

Mozilla's Rhino Project licensed under Mozilla's MPL
http://www.mozilla.org/rhino/
http://www.mozilla.org/MPL/

JArgs licensed under BSD License
http://jargs.sourceforge.net/

JSON in Java licensed under the JSON License
http://www.json.org/java/index.html
http://www.json.org/license.html
