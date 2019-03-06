---
author: "Daniel Little"
date: 2014-08-04T07:00:35Z
description: ""
draft: false
path: "/example-web-config-files-3-5-and-4-5"
title: "Example Web.Config files (3.5 and 4.5)"

---

These are the default generated Web.Config files from Visual Studio 2013 Update 3.

- <a href="#Framework451">Web.Config for .NET Framework 4.5.1</a>
- <a href="#Framework35">Web.Config for .NET Framework 3.5</a>
	 
Other variations are all quite similar but if you think I'm missing one that's useful leave a comment.

<a name="Framework451">**Web.Config for .NET Framework 4.5.1**</a>

	<?xml version="1.0" encoding="utf-8"?>
	<!--
	  For more information on how to configure your ASP.NET application, please visit
	  http://go.microsoft.com/fwlink/?LinkId=301880
	  -->
	<configuration>
	  <configSections>
	    <!-- For more information on Entity Framework configuration, visit http://go.microsoft.com/fwlink/?LinkID=237468 -->
	    <section name="entityFramework" type="System.Data.Entity.Internal.ConfigFile.EntityFrameworkSection, EntityFramework, Version=6.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089" requirePermission="false" />
	  </configSections>
	  <connectionStrings>
	    <add name="DefaultConnection" connectionString="Data Source=(LocalDb)\v11.0;AttachDbFilename=|DataDirectory|\aspnet-WebApplication45-20140804053515.mdf;Initial Catalog=aspnet-WebApplication45-20140804053515;Integrated Security=True"
	      providerName="System.Data.SqlClient" />
	  </connectionStrings>
	  <appSettings>
	    <add key="webpages:Version" value="3.0.0.0" />
	    <add key="webpages:Enabled" value="false" />
	    <add key="ClientValidationEnabled" value="true" />
	    <add key="UnobtrusiveJavaScriptEnabled" value="true" />
	  </appSettings>
	  <system.web>
	    <authentication mode="None" />
	    <compilation debug="true" targetFramework="4.5.1" />
	    <httpRuntime targetFramework="4.5.1" />
	  </system.web>
	  <system.webServer>
	    <modules>
	      <remove name="FormsAuthenticationModule" />
	    </modules>
	  </system.webServer>
	  <runtime>
	    <assemblyBinding xmlns="urn:schemas-microsoft-com:asm.v1">
	      <dependentAssembly>
	        <assemblyIdentity name="System.Web.Helpers" publicKeyToken="31bf3856ad364e35" />
	        <bindingRedirect oldVersion="1.0.0.0-3.0.0.0" newVersion="3.0.0.0" />
	      </dependentAssembly>
	      <dependentAssembly>
	        <assemblyIdentity name="System.Web.Mvc" publicKeyToken="31bf3856ad364e35" />
	        <bindingRedirect oldVersion="1.0.0.0-5.1.0.0" newVersion="5.1.0.0" />
	      </dependentAssembly>
	      <dependentAssembly>
	        <assemblyIdentity name="System.Web.Optimization" publicKeyToken="31bf3856ad364e35" />
	        <bindingRedirect oldVersion="1.0.0.0-1.1.0.0" newVersion="1.1.0.0" />
	      </dependentAssembly>
	      <dependentAssembly>
	        <assemblyIdentity name="System.Web.WebPages" publicKeyToken="31bf3856ad364e35" />
	        <bindingRedirect oldVersion="1.0.0.0-3.0.0.0" newVersion="3.0.0.0" />
	      </dependentAssembly>
	      <dependentAssembly>
	        <assemblyIdentity name="WebGrease" publicKeyToken="31bf3856ad364e35" />
	        <bindingRedirect oldVersion="1.0.0.0-1.5.2.14234" newVersion="1.5.2.14234" />
	      </dependentAssembly>
	    </assemblyBinding>
	  </runtime>
	  <entityFramework>
	    <defaultConnectionFactory type="System.Data.Entity.Infrastructure.LocalDbConnectionFactory, EntityFramework">
	      <parameters>
	        <parameter value="v11.0" />
	      </parameters>
	    </defaultConnectionFactory>
	    <providers>
	      <provider invariantName="System.Data.SqlClient" type="System.Data.Entity.SqlServer.SqlProviderServices, EntityFramework.SqlServer" />
	    </providers>
	  </entityFramework>
	</configuration>

<a name="Framework35">**Web.Config for .NET Framework 3.5**</a>

	<?xml version="1.0"?>
	<configuration>
	
	    <configSections>
	      <sectionGroup name="system.web.extensions" type="System.Web.Configuration.SystemWebExtensionsSectionGroup, System.Web.Extensions, Version=3.5.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35">
	        <sectionGroup name="scripting" type="System.Web.Configuration.ScriptingSectionGroup, System.Web.Extensions, Version=3.5.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35">
	          <section name="scriptResourceHandler" type="System.Web.Configuration.ScriptingScriptResourceHandlerSection, System.Web.Extensions, Version=3.5.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35" requirePermission="false" allowDefinition="MachineToApplication"/>
	          <sectionGroup name="webServices" type="System.Web.Configuration.ScriptingWebServicesSectionGroup, System.Web.Extensions, Version=3.5.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35">
	            <section name="jsonSerialization" type="System.Web.Configuration.ScriptingJsonSerializationSection, System.Web.Extensions, Version=3.5.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35" requirePermission="false" allowDefinition="Everywhere" />
	            <section name="profileService" type="System.Web.Configuration.ScriptingProfileServiceSection, System.Web.Extensions, Version=3.5.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35" requirePermission="false" allowDefinition="MachineToApplication" />
	            <section name="authenticationService" type="System.Web.Configuration.ScriptingAuthenticationServiceSection, System.Web.Extensions, Version=3.5.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35" requirePermission="false" allowDefinition="MachineToApplication" />
	            <section name="roleService" type="System.Web.Configuration.ScriptingRoleServiceSection, System.Web.Extensions, Version=3.5.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35" requirePermission="false" allowDefinition="MachineToApplication" />
	          </sectionGroup>
	        </sectionGroup>
	      </sectionGroup>
	    </configSections>  
	
	    <appSettings />
	    <connectionStrings />
	    <system.web>
	        <compilation debug="true">
	
	          <assemblies>
	            <add assembly="System.Core, Version=3.5.0.0, Culture=neutral, PublicKeyToken=B77A5C561934E089"/>
	            <add assembly="System.Data.DataSetExtensions, Version=3.5.0.0, Culture=neutral, PublicKeyToken=B77A5C561934E089"/>
	            <add assembly="System.Web.Extensions, Version=3.5.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35"/>
	            <add assembly="System.Xml.Linq, Version=3.5.0.0, Culture=neutral, PublicKeyToken=B77A5C561934E089"/>
	          </assemblies>
	
	        </compilation>
	        <!--
	            The <authentication> section enables configuration 
	            of the security authentication mode used by 
	            ASP.NET to identify an incoming user. 
	        -->
	        <authentication mode="Windows" />
	        <!--
	            The <customErrors> section enables configuration 
	            of what to do if/when an unhandled error occurs 
	            during the execution of a request. Specifically, 
	            it enables developers to configure html error pages 
	            to be displayed in place of a error stack trace.
	
	        <customErrors mode="RemoteOnly" defaultRedirect="GenericErrorPage.htm">
	            <error statusCode="403" redirect="NoAccess.htm" />
	            <error statusCode="404" redirect="FileNotFound.htm" />
	        </customErrors>
	        -->
	
	      <pages>
	        <controls>
	          <add tagPrefix="asp" namespace="System.Web.UI" assembly="System.Web.Extensions, Version=3.5.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35"/>
	          <add tagPrefix="asp" namespace="System.Web.UI.WebControls" assembly="System.Web.Extensions, Version=3.5.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35"/>
	        </controls>
	      </pages>
	
	      <httpHandlers>
	        <remove verb="*" path="*.asmx"/>
	        <add verb="*" path="*.asmx" validate="false" type="System.Web.Script.Services.ScriptHandlerFactory, System.Web.Extensions, Version=3.5.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35"/>
	        <add verb="*" path="*_AppService.axd" validate="false" type="System.Web.Script.Services.ScriptHandlerFactory, System.Web.Extensions, Version=3.5.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35"/>
	        <add verb="GET,HEAD" path="ScriptResource.axd" type="System.Web.Handlers.ScriptResourceHandler, System.Web.Extensions, Version=3.5.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35" validate="false"/>
	      </httpHandlers>
	      <httpModules>
	        <add name="ScriptModule" type="System.Web.Handlers.ScriptModule, System.Web.Extensions, Version=3.5.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35"/>
	      </httpModules>
	
	    </system.web>
	
	    <system.codedom>
	      <compilers>
	        <compiler language="c#;cs;csharp" extension=".cs" warningLevel="4"
	                  type="Microsoft.CSharp.CSharpCodeProvider, System, Version=2.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089">
	          <providerOption name="CompilerVersion" value="v3.5"/>
	          <providerOption name="WarnAsError" value="false"/>
	        </compiler>
	     </compilers>
	    </system.codedom>
	    
	    <!-- 
	        The system.webServer section is required for running ASP.NET AJAX under Internet
	        Information Services 7.0.  It is not necessary for previous version of IIS.
	    -->
	    <system.webServer>
	      <validation validateIntegratedModeConfiguration="false"/>
	      <modules>
	        <remove name="ScriptModule" />
	        <add name="ScriptModule" preCondition="managedHandler" type="System.Web.Handlers.ScriptModule, System.Web.Extensions, Version=3.5.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35"/>
	      </modules>
	      <handlers>
	        <remove name="WebServiceHandlerFactory-Integrated"/>
	        <remove name="ScriptHandlerFactory" />
	        <remove name="ScriptHandlerFactoryAppServices" />
	        <remove name="ScriptResource" />
	        <add name="ScriptHandlerFactory" verb="*" path="*.asmx" preCondition="integratedMode"
	             type="System.Web.Script.Services.ScriptHandlerFactory, System.Web.Extensions, Version=3.5.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35"/>
	        <add name="ScriptHandlerFactoryAppServices" verb="*" path="*_AppService.axd" preCondition="integratedMode"
	             type="System.Web.Script.Services.ScriptHandlerFactory, System.Web.Extensions, Version=3.5.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35"/>
	        <add name="ScriptResource" preCondition="integratedMode" verb="GET,HEAD" path="ScriptResource.axd" type="System.Web.Handlers.ScriptResourceHandler, System.Web.Extensions, Version=3.5.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35" />
	      </handlers>
	    </system.webServer>
	    <runtime>
	      <assemblyBinding appliesTo="v2.0.50727" xmlns="urn:schemas-microsoft-com:asm.v1">
	        <dependentAssembly>
	          <assemblyIdentity name="System.Web.Extensions" publicKeyToken="31bf3856ad364e35"/>
	          <bindingRedirect oldVersion="1.0.0.0-1.1.0.0" newVersion="3.5.0.0"/>
	        </dependentAssembly>
	        <dependentAssembly>
	          <assemblyIdentity name="System.Web.Extensions.Design" publicKeyToken="31bf3856ad364e35"/>
	          <bindingRedirect oldVersion="1.0.0.0-1.1.0.0" newVersion="3.5.0.0"/>
	        </dependentAssembly>
	      </assemblyBinding>
	    </runtime>
	
	</configuration>
