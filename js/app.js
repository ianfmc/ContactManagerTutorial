(function ($) {
 
    var contacts = [
        { name: "Portia Zhu", address: "Town, City Zip", tel: "XXX XXX XXXX", email: "anemail@me.com", position: "Goalkeeper" },
        { name: "Leslie Strong", address: "Town, City Zip", tel: "XXX XXX XXXX", email: "anemail@me.com", position: "Driver" },
        { name: "Amy Patrick", address: "Town, City Zip", tel: "XXX XXX XXXX", email: "anemail@me.com", position: "Goalkeeper" },
        { name: "Amelia Starr", address: "Town, City Zip", tel: "XXX XXX XXXX", email: "anemail@me.com", position: "Driver" },
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
	}
});

var directory = new DirectoryView()

} (jQuery));