---
author: "Daniel Little"
date: 2013-01-21T02:00:00Z
description: ""
draft: false
path: "/ef-multiple-cascade-paths"
title: "Entity Framework and Foreign key constraint may cause cycles or multiple cascade paths"

---

Today I ran into the `Foreign key constraint may cause cycles or multiple cascade paths` issue for the first time. The first thing to note is the error isn't actually from Entity Framework it's from [SQL Server](https://stackoverflow.com/questions/851625/foreign-key-constraint-may-cause-cycles-or-multiple-cascade-paths).

    Introducing FOREIGN KEY constraint 'ConstraintName' on table 'TableName' may cause cycles or multiple cascade paths. Specify ON DELETE NO ACTION or ON UPDATE NO ACTION, or modify other FOREIGN KEY constraints.

I was however using EF5 Code First so I fist needed to figure out why my model was giving me back this error. The error message itself pointed me to the Schema table referring to the Project table. Note my schema looks a bit like this:

    Project { Id, Name }
    Schema { Id, ProjectId, ... }
    Node { Id, ProjectId, ... }

As you can see there are two relationships to the Projects table, which is usually fine. The issue comes from the fact that EF using the `OneToManyCascadeDeleteConvention` convention my default. Which was not what I wanted for these two relationships.

My EF model takes the convention and attribute approach, I try to avoid the fluent API to keep everything in the one place. However there is currently no attribute to turn off cascade delete.

Here is how to do it using the fluent API:

	internal sealed class SchemaConfiguration : EntityTypeConfiguration<Schema>
	{

		public SchemaConfiguration()
		{
			this
				.HasRequired(x => x.Project)
				.WithMany()
				.WillCascadeOnDelete(false);
		}
	}

	/// <summary>
	/// Model Creating Event Handler.
	/// </summary>
	protected override void OnModelCreating(DbModelBuilder modelBuilder)
	{
		modelBuilder.Configurations.Add(new NodeConfiguration());
	}

[Need more help](https://stackoverflow.com/questions/5532810/entity-framework-code-first-defining-relationships-keys)