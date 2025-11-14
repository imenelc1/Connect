import React from 'react';
/*
Proprietés : 
label : texte au dessus du champ de saisie
name:identifiant du champ
value : valeur actuelle
Onchange :fonction pour notifier le parent quand l'utlisateur tape 
type ,placeholderrr

*/
const Input = ({label,name,value,onChange,type="text",placeholder}) => {
    return (
    <div className="flex flex-col space-y-1">
    <label className="text-sm text-gray-600">{label}</label>
    <input
    name={name}
    value={value}// valeur controlé depuis le parent
    onChange={onChange} // renvois l'evenement au parent
    type={type}
    placeholder={placeholder}
    className="border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300 text-sm"
    />
            
    </div>
    );
};
export default Input;