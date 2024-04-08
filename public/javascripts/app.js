document.addEventListener('DOMContentLoaded', () => {
  class Manager {
    constructor() {
      this.contact = null;
      this.loadContacts();
      this.addEvents();
      this.formFields = {
        full_name: document.getElementById('full_name'),
        email: document.getElementById('email'),
        phone_number: document.getElementById('phone_number'),
        tags: document.getElementById('tags'),
      }
      this.tags = ['marketing', 'sales', 'engineering'];
    }

    addEvents() {
      let form = document.querySelector('#add-contact-form');
      document.addEventListener('click', event => {
        let id = event.target.id;
        if (id === 'add-button')  {
          this.displayTags();
          form.reset();
          document.querySelector('h2').textContent = 'Create Contact'
          $('#add-contact-box').slideToggle();
        } else if (id === 'edit-button') {
          let targetId = event.target.dataset;
          this.contact = targetId;
          this.loadContactData();
          this.displayTags();
        } else if (id === 'delete-button') {
          this.delete(event.target.dataset.id);
        } else if (id === 'back-button') {
          $('#add-contact-box').slideToggle();
        } else if (event.target.className === 'tag-link') {
          this.filterByTag(event.target.textContent);
        } else if (id === 'clear-filter') {
          document.querySelector('#search-box').value = '';
          this.searchContacts = this.contacts
          this.displayContacts();
          event.target.remove();
        } else if (event.target.className === 'tag-delete') {
          let tagToRemove = event.target.dataset.tag;
          this.tags = this.tags.filter(tag => {
            return tag !== tagToRemove;
          });
          event.target.parentNode.parentNode.remove();
        }
      });

      form.addEventListener('submit', event => {
        event.preventDefault();
        if (this.contact) {
          this.edit();
        } else {
          this.add();
        }
      });

      document.querySelector('#add-tag').addEventListener('click', event => {
        event.preventDefault();
        let tagField = document.querySelector('#tag-field');
        this.tags.push(tagField.value);
    
        let label = document.createElement('label');
        let input = document.createElement('input');
        let text = document.createTextNode(` ${tagField.value} `);
   
        input.type = 'checkbox';
        input.name = tagField.value;
        input.value = tagField.value;
        label.append(input);
        label.append(text);
        document.querySelector('#tags').append(label);
        tagField.value = '';
        this.displayTags();
      });

      let searchBox = document.querySelector('#search-box');
      searchBox.addEventListener('keyup', (event) => {
        event.preventDefault();
        let clearFilter = !document.querySelector('#clear-filter');
        if (!clearFilter) {
          this.addClearFilterButton();
        } else if (searchBox.value === '') {
          clearFilter.remove();
        }

        this.searchContacts = this.contacts.filter(contact => {
          return contact.full_name.startsWith(searchBox.value);
        });
        
        this.displayContacts();
      });
    }

    addClearFilterButton() {
      let button = document.createElement('button');
      button.id = 'clear-filter';
      button.textContent = 'Clear Filters';
      button.classList.add('button');
      document.querySelector('#add-button').insertAdjacentElement('afterend', button);
    }

    filterByTag(tag) {
      if (!document.querySelector('#clear-filter')) {
        this.addClearFilterButton();
      }
   
      this.searchContacts = this.contacts.filter(contact => {
        return contact.tags.includes(tag);
      });

      this.displayContacts();
    }

    loadContacts() {
      let request = new XMLHttpRequest();
      request.open('GET', 'http://localhost:3000/api/contacts');
      request.addEventListener('load', () => {
        this.contacts = JSON.parse(request.response);
        this.searchContacts = this.contacts;
        this.contacts.forEach(contact => {
          if (contact.tags !== '') {
            contact.tags = contact.tags.split(',');
          }
        });
    
        this.displayContacts();
      });

      request.send();
    }

    displayContacts() {
      let contactTemplate = document.querySelector('#contact-template');
      let compiledTemplate = Handlebars.compile(contactTemplate.innerHTML);
      let contactList = document.querySelector('#contact-list');
      contactList.innerHTML = compiledTemplate(this);
    }

    displayTags() {
      let tagTemplate = document.querySelector('#tag-template');
      let compiledTemplate = Handlebars.compile(tagTemplate.innerHTML);
      let tags = document.querySelector('#tags');
      tags.innerHTML = compiledTemplate(this);
    }

    getJson() {
      let form = document.querySelector('#add-contact-form');
      let data = new FormData(form);
      let tagInput = document.querySelectorAll('#tags input[type="checkbox"]');
      let tags = [...tagInput].filter(tag => {
        return tag.checked;
      }).map(tag => tag.value).join(',');
      let json = { tags: tags };
      data.forEach((v, k) => json[k] = v);
      data = JSON.stringify(json);
      return data;
    }

    add() {
      let data = this.getJson();
      let request = new XMLHttpRequest();
      request.open('POST', 'http://localhost:3000/api/contacts/');
      request.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
      request.send(data);
      this.loadContacts();
      document.querySelector('#back-button').click();
    }

    loadContactData() {
      document.querySelector('h2').textContent = 'Edit Contact'
      let request = new XMLHttpRequest();
      request.open('GET', `http://localhost:3000/api/contacts/${this.contact.id}`);
      request.addEventListener('load', () => {
        let contact = JSON.parse(request.response)
        for (let field in this.formFields) {
          if (field === 'tags') {
            contact[field].split(',').forEach(tag => {
              if (!this.tags.includes(tag)) this.tags.push(tag);
            });
          } else {
            this.formFields[field].value = contact[field];
          }
        }

        this.displayTags();
        contact.tags.split(',').forEach(tag => {
          document.querySelector(`[value="${tag}"]`).checked = true;
        });

        document.querySelector('#back-button').click();
      });
      
      request.send();
    }

    edit() {
      let data = this.getJson();
      let request = new XMLHttpRequest();
      request.open('PUT', `http://localhost:3000/api/contacts/${this.contact.id}`);
      request.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
      request.send(data);
      this.loadContacts();
      this.contact = null;
      document.querySelector('#back-button').click();
    }

    delete(id) {
      let request = new XMLHttpRequest();
      request.open('DELETE', `http://localhost:3000/api/contacts/${id}`);
      request.send();
      this.loadContacts();
    }
  }

  new Manager();
});