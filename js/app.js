(function ($) {
 
    var contacts = [
        { name: "Portia Zhu", position: "goalkeeper" },
        { name: "Leslie Strong", position: "driver" },
        { name: "Amy Patrick", position: "goalkeeper" },
        { name: "Amelia Starr", position: "driver" },
    ];
 
var Contact = Backbone.Model.extend({
    defaults: {
        photo: "img/placeholder.png"
    }
});

var Directory = Backbone.Collection.extend({
    model: Contact
});

var ContactView = Backbone.View.extend({
    tagName: "article",
    className: "contact-container",
    template: $("#contactTemplate").html(),
 
    render: function () {
        var tmpl = _.template(this.template);
 
        this.$el.html(tmpl(this.model.toJSON()));
        return this;
    },
    
    events : {
        "click button.delete": "deleteContact"
    },
    
    deleteContact: function () {
	    var removedType = this.model.get("position").toLowerCase();
	    this.model.destroy();
	 
	    this.remove();
	 
	    if (_.indexOf(directory.getTypes(), removedType) === -1) {
	        directory.$el.find("#filter select").children("[value='" + removedType + "']").remove();
	    }
	}
});

var DirectoryView = Backbone.View.extend({
    el: $("#contacts"),
    
    defaults: {
	    name: "New Player",
	    position: "Position"
    },
 
    initialize: function () {
        this.collection = new Directory(contacts);
        
        this.render();
        this.$el.find("#filter").append(this.createSelect()); 
        
        this.on("change:filterType", this.filterByType, this);
        this.collection.on("reset", this.render, this);
        
        this.collection.on("add", this.renderContact, this);
    },
 
    render: function () {
        this.$el.find("article").remove();

        _.each(this.collection.models, function (item) {
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
	        return type.toLowerCase();
	    });
	},
	 
	createSelect: function () {
	    var filter = this.$el.find("#filter"),
	        select = $("<select/>", {
	            html: "<option value='all'>all</option>"
	        });
	 
	    _.each(this.getTypes(), function (item) {
	        var option = $("<option/>", {
	            value: item.toLowerCase(),
	            text: item.toLowerCase()
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
	 
	    var newModel = {};
	    
	    $("#addContacts").children("input").each(function (i, el) {
	        if ($(el).val() !== "") {
	            newModel[el.id] = $(el).val();
	        }
	    });
	 
	    contacts.push(newModel);
	 
	    if (_.indexOf(this.getTypes(), newModel.type) === -1) {
	        this.collection.add(new Contact(newModel));
	        this.$el.find("#filter").find("select").remove().end().append(this.createSelect()); 
	    } else {
	        this.collection.add(new Contact(newModel));
	    }
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