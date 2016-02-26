var loop = require('vdom-loop');
var xtend = require('xtend');
var observify = require('observify');
var oStruct = require('observ-struct');
var oArray = require('observ-array');
var observ = require('observ');
var form = require('virtual-form');
var h = loop.h;

var fields = [
  { fName: 'name', isValid: (value) => { return !!(value && value.length > 3); } },
  { fName: 'title', isValid: (value) => { return !!(value && value.length > 3); } }
];

var state = oStruct({
  fields: oArray(fields.map((f) => {
    return observify(xtend(f, {
      value: '',
      isValid: f.isValid(''),
      hasFocused: false,
      fns: { isValid: f.isValid }
    }));
  }))
});

function render(data) {
  return h('form', {
    onchange: console.log.bind(console, 'form change'),
    onsubmit: (ev) => {
      var log = console.log.bind(console);
      var els = ev.target.elements;
      ev.preventDefault();
      log(ev.target);
      log(els.name.value, els.title.value);
    }
  }, form(h, data.fields.map((f, i) => {
      console.log(f);
      return { type: 'text', value: f.value, name: f.fName,
        placeholder: f.fName,
        onkeyup: (ev) => {
          var v = f.fns.isValid(ev.target.value);
          state.fields.get(i).value.set(ev.target.value);
          state.fields.get(i).isValid.set(v);
        },
        onfocus: (ev) => {
          state.fields.get(i).hasFocused.set(true);
        },
        style: {
          borderColor: !f.isValid && f.hasFocused ? 'red' : 'initial'
        }
      };
    }).concat({
      type: 'submit',
      value: 'save',
      disabled: !data.fields.reduce((acc, f) => {
        console.log(acc && f.isValid);
        return acc && f.isValid;
      }, true)
    }))
  );
}

var el = loop(state, render);
document.body.appendChild(el);
