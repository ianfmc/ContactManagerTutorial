(function ($) {
 
    var contacts = [
        { name: "Portia Zhu", position: "Goalkeeper" },
        { name: "Leslie Strong", position: "Driver" },
        { name: "Amy Patrick", position: "Goalkeeper" },
        { name: "Amelia Starr", position: "Driver" },
        { name: "Kathy Duffy", position: "Set" },
    ];
 
	var Contact = Parse.Object.extend( "Player", {
	    defaults: {
	        PlayerName: "New Player", 
	        Position: "Position", 
	        Number: "#"
	    },
	    
	    className: "Contact",
	});
	
	var Directory = Parse.Collection.extend({
	    model: Contact
	});
	
	var ContactView = Parse.View.extend({
	    
		tagName: "article",
        className: "contact-container",
        
        template: _.template($("#contactTemplate").html()),
        editTemplate: _.template($("#contactEditTemplate").html()),	
         
	    render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
	    },
	    
	    events : {
	        "click button.delete": "deleteContact",
	        
	        "click button.edit": "editContact",
			"click button.save": "saveEdits",
			"click button.cancel": "cancelEdit"
	    },
	    
	    deleteContact: function () {
		    var removedType = this.model.get("position").toLowerCase();
		    this.model.destroy();
		 
		    this.remove();
		 
		    if (_.indexOf(directory.getTypes(), removedType) === -1) {
		        directory.$el.find("#filter select").children("[value='" + removedType + "']").remove();
		    }
		},
		
		editContact: function () {
			console.log("Editing Contact");
			this.$el.html(this.editTemplate(this.model.toJSON()));
			
		    /* Need to repair the commented code here
			   Does not compile
			   
		    var newOpt = $("<option/>", {
		        html: "<em>Add new...</em>",
		        value: "addType"   
		    }),
		 
		    this.select = directory.createSelect().addClass("type")
		        .val(this.$el.find("#type").val()).append(newOpt)
		        .insertAfter(this.$el.find(".name"));
		 
		    this.$el.find("input[type='hidden']").remove();
		    
		    */
		},
		
        addType: function () {
            if (this.select.val() === "addPosition") {

                this.select.remove();

                $("<input />", {
                    "class": "position"
                }).insertAfter(this.$el.find(".name")).focus();
            }
        },
		
		saveEdits: function(e) {
			console.log("Saving the Edits");
		    e.preventDefault();
		 
		    var formData = {},
		        prev = this.model.previousAttributes();
		 
		    $(e.target).closest("form").find(":input").add(".photo").each(function () {
		 
		        var el = $(this);
		        formData[el.attr("class")] = el.val();
		    });
		 
		    if (formData.photo === "") {
		        delete formData.photo;
		    }
		 
		    this.model.set(formData);
		    console.log(formData);
		 
		    this.render();
		 
		    if (prev.photo === "/img/placeholder.png") {
		        delete prev.photo;
		    }
		 
		    _.each(contacts, function (contact) {
		        if (_.isEqual(contact, prev)) {
		            contacts.splice(_.indexOf(contacts, contact), 1, formData);
		        }
		    });
		},			
				
		cancelEdit: function() {
			console.log("Cancel Edit");
			this.render();
		}
	});
	
	var DirectoryView = Parse.View.extend({
	    el: $("#contacts"),
	    
	    initialize: function () {
		    
		    Parse.$ = jQuery;
		    
		    Parse.initialize("7PKnbx3M6cFUl7qcKj6fVbEga5gBkF5l4lSdbxIm", 
						     "FuDspLU513MZuagHRssvnLZnSGe9HVpvwtHlT8G2"); 
		    
	        var Player = Parse.Object.extend("Player");
	        var q = new Parse.Query(Player);
	        q.find();
	        
	        this.collection = q.collection();
	        this.collection.fetch();
	        
	        this.render();
	        this.$el.find("#filter").append(this.createSelect()); 
	        
	        this.on("change:filterType", this.filterByType, this);
	        this.collection.on("reset", this.render, this);	        
	        this.collection.on("add", this.renderContact, this);
	    },
	 
	    render: function () {
	        this.$el.find("article").remove();
	
	        _.each(this.collection.models, function (item) {
		        console.log(item);
	            this.renderContact(item);
	        }, this);
	    },
	 
	    renderContact: function (item) {
	        var contactView = new ContactView({
	            model: item
	        });
	        this.$el.append(contactView.render().el);
	    },
	    
		getTypes: function () {
		    return _.uniq(this.collection.pluck("position"), false, function (type) {
		        return type;
		    });
		},
		 
		createSelect: function () {
		    var filter = this.$el.find("#filter"),
		        select = $("<select/>", {
		            html: "<option value='all'>All</option>"
		        });
		 
		    _.each(this.getTypes(), function (item) {
		        var option = $("<option/>", {
		            value: item,
		            text: item
		        }).appendTo(select);
		    });
		    return select;
		},
		
		events: {
			"change #filter select": "setFilter",
			"click #add": "addContact",
			"click #showFormButton": "showForm"
		},
		
		setFilter: function (e) {
		    this.filterType = e.currentTarget.value;
		    this.trigger("change:filterType");
		},
		
	    filterByType: function () {
	        if (this.filterType === "all") {
	            this.collection.reset(contacts);
	            contactsRouter.navigate("filter=all");
	        } else {
	            this.collection.reset(contacts, { silent: true });
	
	            var filterType = this.filterType,
	                filtered = _.filter(this.collection.models, function (item) {
	                    return item.get("position") === filterType;
	                });
	
	            this.collection.reset(filtered);
	            contactsRouter.navigate("filter=" + filterType);
	        }
	    },
	    
	    addContact: function (e) {
		    e.preventDefault();
		 
		    var newModel = {}; /* is this of type Player? */
		    		    
		    $("#addContacts").children("input").each(function (i, el) {
		        if ($(el).val() !== "") {
		            newModel[el.id] = $(el).val();
		        }
		    });
		 
		    contacts.push(newModel);
		 
		    if (_.indexOf(this.getTypes(), newModel.position) === -1) {
		        this.collection.add(new Contact(newModel));
		        this.$el.find("#filter").find("select").remove().end().append(this.createSelect()); 
		    } else {
		        this.collection.add(new Contact(newModel));
		    }
		    
			console.log(newModel);
		},
		    
	    showForm: function () {
		    this.$el.find("#addContacts").slideToggle();
		}
	});
	
	var ContactsRouter = Backbone.Router.extend({
	    routes: {
	        "filter/:type": "urlFilter"
	    },
	 
	    urlFilter: function (type) {
		    console.log("navigating");
	        directory.filterType = type;
	        directory.trigger("change:filterType");
	    }
	});

	var directory = new DirectoryView();
	var contactsRouter = new ContactsRouter();
	
	Backbone.history.start();

} (jQuery));