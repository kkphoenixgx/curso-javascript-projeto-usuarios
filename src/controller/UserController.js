class UserController {

    constructor (formId, tableId){

        this.formEl = document.getElementById(formId);
        this.tableEl = document.getElementById(tableId);

        this.onSubmit()

    }

    onSubmit(){

        this.formEl.addEventListener("submit", event => {
            event.preventDefault();

            let values = this.getValues();
            let btn = this.formEl.querySelector("[type=submit]");
            
            btn.disable = true;
            this.getPhoto().then(
                (content) => {
                    values.photo = content;
                    this.addUserLine(values);
                    this.formEl.reset();
                    btn.disable = false;
                }, 
                (e) => {
                    console.error(e)
                }
            );
        
        });

    }

    getPhoto(){

        return new Promise((resolve, reject) => {

            let fileReader = new FileReader();

            let elements = [...this.formEl.elements].filter(item => {
                if (item.name === 'photo') {
                    return item;
                }
            });

            let file = elements[0].files[0];
            fileReader.onload = () => {
                resolve(fileReader.result);
            };

            fileReader.onerror = (e) => {
                reject(e);
            };

            if(file){
                fileReader.readAsDataURL(file);   
            }else{
                resolve('dist/img/boxed-bg.jpg');
            }

        });

    }

    getValues(){

        let user = {};
        let valid = true;

        [...this.formEl.elements].forEach(function(field){
            if(['name', 'password', 'email'].indexOf(field.name) > -1 && !field.value){
                field.parentElement.classList.add('has-error');
                valid = false;
            }
            
            if (field.name === "gender") {

                if (field.checked) {
                    user[field.name] = field.value;
                }

            }
            else if(field.name == "admin"){
                user[field.name] = field.checked;

            }else {
                user[field.name] = field.value;
            }
    
        });
    
        if(!valid){
            return false; 
        };
        return new User(
            user.name, 
            user.gender, 
            user.birth, 
            user.country, 
            user.email, 
            user.password, 
            user.photo, 
            user.admin
        );
        
    }

    addUserLine(dataUser) {

        var tr = document.createElement('tr');

        tr.innerHTML = `
                        <td><img src=${dataUser.photo} class="img-circle img-sm"></td>
                        <td>${dataUser.name}</td>
                        <td>${dataUser.email}</td>
                        <td>${(dataUser.admin) ? 'Sim':'Não'}</td>
                        <td>${Utils.dateFormate(dataUser.register)}</td>
                        <td>
                            <button type="button" class="btn btn-primary btn-xs btn-flat">Editar</button>
                            <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
                        </td>
                    `;
        
        this.tableEl.appendChild(tr);

    }

}