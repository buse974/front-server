angular.module('app_social')
    .factory('welcome_service',[ 'community_service', '$q',
            'session', 'modal_service', 'user_model',  'filters_functions',
            'connections', 'countries', 'profile', '$timeout',
        function( community_service, $q,
            session, modal_service, user_model,  filters_functions,
            connections, countries, profile, $timeout){
 
            var service = {
                session : session,
                users : user_model.list,
                available_steps : {
                    connections : {
                        title : "Start building your network!",
                        steptitle : "Add connections",
                        hint : "Invite people to join your network.",
                        priority : 100,
                        count : 0,
                        total : 0,
                        pagination : { n : 20, p : 1 },
                        selected : {},
                        next : function(){
                            if(!service.available_steps.connections.loading && !service.available_steps.connections.ended){
                                service.available_steps.connections.loading = true;
                                service.available_steps.connections.pagination.p++;
                                return community_service.users( 
                                    null, 
                                    service.available_steps.connections.pagination.p, 
                                    service.available_steps.connections.pagination.n, 
                                    [session.id], null, null, null, null, { type : 'affinity' }, 
                                    0)
                                    .then(function(users){
                                        service.available_steps.connections.suggestions = service.available_steps.connections.suggestions.concat(users.list);
                                        service.available_steps.connections.loading = false;
                                        service.available_steps.connections.ended = users.list.length < service.available_steps.connections.pagination.n;
                                });
                            }
                        },
                        isCompleted : function(){
                            return connections.load().then(function(){
                                return connections.connecteds.length + connections.requesteds.length >= 10;
                            });
                        },
                        addConnection : function(user_id){
                            if(!service.available_steps.connections.selected[user_id]){
                                service.available_steps.connections.count++;
                                service.available_steps.connections.selected[user_id] = true;
                                connections.request( user_id );
                            }
                            else{
                                service.available_steps.connections.count--;
                                service.available_steps.connections.selected[user_id] = false;
                                connections.remove( user_id );
                            }
                        },
                        fill : function(){
                            service.available_steps.connections.count = connections.connecteds.length + connections.requesteds.length;
                            service.available_steps.connections.total = (connections.connecteds.length + connections.requesteds.length) > 10 ? 1 : 10;
                            if(!service.available_steps.connections.initialized){
                                return community_service.users( 
                                    null, 
                                    service.available_steps.connections.pagination.p, 
                                    service.available_steps.connections.pagination.n, 
                                    [session.id], null, null, null, null, { type : 'affinity' }, 
                                    0)
                                    .then(function(users){

                                    service.available_steps.connections.suggestions = users.list;
                                });
                            }
                            else{
                                var deferred = $q.defer();
                                deferred.resolve(true);
                                return deferred.promise;
                            }
                        }.bind(this)
                    },
                    avatar : {
                        title : "Set profile picture",
                        hint : "Don't be a stranger! Your photo will make it easier for your teamates to recognize you.",
                        priority : 99,
                        isCompleted : function(){
                            return user_model.queue([session.id]).then(function(){
                                return user_model.list[session.id].datum.avatar;
                            });
                        },
                        onComplete : function(){
                            if(service.available_steps.avatar.avatar){
                                service.available_steps.avatar.crop().then(function(blob){
                                    profile.updateAvatar(blob, session.id);
                                });
                            }
                            else{
                                profile.updateAvatar(null, session.id);
                            }
                            service.nextStep();
                        },
                        fill : function(){
                            return user_model.queue([session.id]).then(function(){
                                if(!service.available_steps.avatar.avatar && user_model.list[session.id].datum.avatar){
                                    service.available_steps.avatar.avatar = filters_functions.dmsLink(user_model.list[session.id].datum.avatar);
                                    service.available_steps.avatar.loadCropper( service.available_steps.avatar.avatar, false, true );
                                }
                                return true;
                            });
                        },
                        onAvatarFile : function( files, input ){
                            if( files && files.length ){
                                service.available_steps.avatar.avatar =  URL.createObjectURL(files[0]);
                                $timeout(function(){
                                    service.available_steps.avatar.loadCropper( service.available_steps.avatar.avatar, false, true );
                                });
                               
                            }
                            else{
                                service.available_steps.avatar.avatar =  null;
                                $timeout(function(){
                                    service.available_steps.avatar.loadCropper( null, false, true );
                                });
                            }
                            if(input){
                                input.value = null;
                            }
                        },
                        avatars : [
                            'assets/img/avatar1.svg',
                            'assets/img/avatar2.svg',
                            'assets/img/avatar3.svg',
                            'assets/img/avatar4.svg',
                            'assets/img/avatar5.svg',
                            'assets/img/avatar6.svg',
                            'assets/img/avatar7.svg',
                            'assets/img/avatar8.svg',
                            'assets/img/avatar9.svg',
                            'assets/img/avatar10.svg',
                            'assets/img/avatar11.svg',
                            'assets/img/avatar12.svg',
                            'assets/img/avatar13.svg',
                            'assets/img/avatar14.svg',
                            'assets/img/avatar15.svg',
                            'assets/img/avatar16.svg',
                            'assets/img/avatar17.svg',
                            'assets/img/avatar18.svg',
                            'assets/img/avatar19.svg',
                            'assets/img/avatar20.svg',
                            'assets/img/avatar21.svg',
                            'assets/img/avatar22.svg',
                            'assets/img/avatar23.svg',
                            'assets/img/avatar24.svg',
                        ]
                    },
                    address : {
                        title : "Tell your peers<br/> about yourself!",
                        steptitle : "About yourself",
                        hint : "Everyone has a story and it always starts with a journey!",
                        priority : 98,
                        isCompleted : function(){
                            return user_model.queue([session.id]).then(function(){
                                return user_model.list[session.id].datum.address || user_model.list[session.id].datum.origin;
                            });
                        },
                        onComplete : function(){
                            profile.updateAddress(service.available_steps.address.tmpAddress, session.id);
                            profile.updateOrigin(service.available_steps.address.tmpOrigin, session.id);
                            service.nextStep();
                        },
                        fill : function(){
                            return user_model.queue([session.id]).then(function(){
                                var me = user_model.list[session.id].datum;
                                if(me.origin){
                                    service.available_steps.address.tmpOrigin = me.origin.short_name;
                                }
                                if(me.address && me.address.id){
                                    service.available_steps.address.tmpAddress = filters_functions.address(me.address);
                                }
                                return true;                               
                            });
                        },
                        searchOrigin : function(search){
                            if(!search){
                                service.available_steps.address.tmpOrigin = null;
                                return [];
                            }
                            else{
                                return countries.getList(search);
                            }
                        },
                    }
                },
                steps : [],
                        
                changeState : function(index){
                    if(service.steps[index] && service.steps[index].fill){
                        service.current_index = index;
                        service.current_step = service.steps[index];
                        service.loading = true;
                        return service.steps[index].fill().then(function(){
                            service.loading = false;
                            service.steps[index].initialized = true;
                            if(!modal_service.opened){
                                modal_service.open( {
                                    template: 'app/components/app_social/tpl/welcome.template.html',
                                    scope: service,
                                    blocked : true,
                                    reference: document.activeElement,
                                    onclose : service.onClose
                                });
                            }
                        });
                    }
                    else{
                        modal_service.close();
                    }
                },
                nextStep : function(){
                    service.changeState(service.current_index + 1);
                },
                init : function(){
                    service.steps = [];
                    var steps = Object.keys(service.available_steps).length;
                    angular.forEach(service.available_steps, function(step){
                        step.isCompleted().then(function(done){
                            if(!done){
                                service.steps.push(step);
                            }
                            onLoad();
                        });
                    });
                    function onLoad(){
                        steps--;
                        if((service.steps.length > 0 && steps === 0) || service.steps.length === 3){
                            service.steps.sort(function(s1, s2){
                               return s1.priority < s2.priority; 
                            });
                            service.changeState(0);
                        }
                    }
                    
           
                },
                onClose : function(){
                    profile.closeWelcome(service.delay);
                }
            };
    
            
          

            return service;
        }
    ]);
