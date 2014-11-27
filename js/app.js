(function ($) {
 
    var contacts = [
        { name: "Portia Zhu", address: "Town, City Zip", tel: "XXX XXX XXXX", email: "anemail@me.com", position: "goalkeeper" },
        { name: "Leslie Strong", address: "Town, City Zip", tel: "XXX XXX XXXX", email: "anemail@me.com", position: "driver" },
        { name: "Amy Patrick", address: "Town, City Zip", tel: "XXX XXX XXXX", email: "anemail@me.com", position: "goalkeeper" },
        { name: "Amelia Starr", address: "Town, City Zip", tel: "XXX XXX XXXX", email: "anemail@me.com", position: "driver" },
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
    }
});

var DirectoryView = Backbone.View.extend({
    el: $("#contacts"),
 
    initialize: function () {
        this.collection = new Directory(contacts);
        
        this.render();
        this.$el.find("#filter").append(this.createSelect()); 
        
        this.on("change:filterType", this.filterByType, this);
        this.collection.on("reset", this.render, this);
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
		"change #filter select": "setFilter"
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