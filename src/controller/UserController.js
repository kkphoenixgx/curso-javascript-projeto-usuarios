// @collapse 
class UserController {

    constructor (formIdCreate, formIdUpdate ,tableId){

        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);

        this.onSubmit();
        this.onEdit();

    }

    onEdit(){
        document.querySelector(".btn-cancel").addEventListener('click', e=>{
            this.showPanelCreate();
        });

        this.formUpdateEl.addEventListener("submit", event=>{
            event.preventDefault();
            let btn = this.formUpdateEl.querySelector("[type=submit]");
            btn.disable = true;

            let values = this.getValues(this.formUpdateEl);
            let index = this.formUpdateEl.dataset.rowIndex;
            let tr = this.tableEl.rows[index];
            let oldUser = JSON.parse(tr.dataset.user);

            let result = Object.assign({}, oldUser, values); 
            
            
            this.getPhoto(this.formUpdateEl).then(
                (content) => {

                    if(!values.photo) {
                        result._photo = oldUser._photo;
                    }else {
                        result._photo = content;
                    }

                    tr.dataset.user =  JSON.stringify(result);

                    tr.innerHTML = `
                                        <td><img src=${result._photo} class="img-circle img-sm"></td>
                                        <td>${result._name}</td>
                                        <td>${result._email}</td>
                                        <td>${(result._admin) ? 'Sim':'Não'}</td>
                                        <td>${Utils.dateFormate(result._register)}</td>
                                        <td>
                                        <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                                        <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
                                        </td>
                                    `; 
                    
                    this.eventSubmitTr(tr);
                    this.refreshUserNumbers();
                    
                    this.formUpdateEl.reset();
                    btn.disable = false;
                    this.showPanelCreate();
                }, 
                (e) => {
                    console.error(e)
                }
            );
        })

    }

    onSubmit(){

        this.formEl.addEventListener("submit", event => {
            event.preventDefault();

            let values = this.getValues(this.formEl);
            let btn = this.formEl.querySelector("[type=submit]");
            btn.disable = true;

            if(!values) return false;

            this.getPhoto(this.formEl).then(
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

    getPhoto(formEl){

        return new Promise((resolve, reject) => {

            let fileReader = new FileReader();

            let elements = [...formEl.elements].filter(item => {
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

    getValues(formEl){

        let user = {};
        let valid = true;

        [...formEl.elements].forEach(function(field){
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

    eventSubmitTr(tr){

        document.querySelector(".btn-remove").addEventListener('click', e =>{
            
            if(confirm("deseja excluir realmente?")){
                tr.remove();
                this.refreshUserNumbers();
            }

        });

        document.querySelector(".btn-edit").addEventListener('click', e =>{
            this.showPanelUpdate();
            
            let json = JSON.parse(tr.dataset.user);

            this.formUpdateEl.dataset.rowIndex = tr.sectionRowIndex;

            for(let name in json){

                let field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "]");

                if(field){
                    switch(field.type){

                        case 'file':
                        continue;
                        break;
                        case 'radio':
                            field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "]" + "[value="+json[name] + "]");
                            field.checked = true;
                            break
                        case 'checkbox':
                            field.checked = json[name];
                        break
                        default:
                            field.value = json[name];
                    }
                }

                this.formUpdateEl.querySelector(".photo").src = json._photo;

            }
        });
    }

    addUserLine(dataUser) {

        var tr = document.createElement('tr');
        tr.dataset.user = JSON.stringify(dataUser);

        tr.innerHTML = `
                        <td><img src=${dataUser.photo} class="img-circle img-sm"></td>
                        <td>${dataUser.name}</td>
                        <td>${dataUser.email}</td>
                        <td>${(dataUser.admin) ? 'Sim':'Não'}</td>
                        <td>${Utils.dateFormate(dataUser.register)}</td>
                        <td>
                            <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                            <button type="button" class="btn btn-danger btn-remove btn-xs btn-flat">Excluir</button>
                        </td>
                    `;
        
        this.tableEl.appendChild(tr);
        this.refreshUserNumbers();
        this.eventSubmitTr(tr);
    }

    refreshUserNumbers(){
        let numberAdmins = 0;
        let numberUsers = 0;

        [...this.tableEl.children].forEach(tr=>{
            let user = JSON.parse(tr.dataset.user)
            if(user._admin){
                numberAdmins++;
            }else{
                numberUsers++;
            }
        })

        document.querySelector("#number-admin").innerHTML = numberAdmins;
        document.querySelector("#number-users").innerHTML = numberUsers;
    }

    showPanelUpdate(){
        document.querySelector("#box-user-create").style.display = "none";
        document.querySelector("#box-user-edit").style.display = "block";            
        document.querySelector("#title-new-userEdit").innerText = "Editar Usuário";
    }

    showPanelCreate(){
        document.querySelector("#box-user-create").style.display = "block";
        document.querySelector("#box-user-edit").style.display = "none"; 
        document.querySelector("#title-new-user").innerText = "Novo Usuário";
    }

}