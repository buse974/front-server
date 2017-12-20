
angular.module('API')
    .factory('community_service',['api_service','$q','page_model','user_model',
        function( api_service, $q, page_model, user_model ){
    
            var service = {
                users: function( search, p, n, exclude, page_id, role, random, page_type ){
                    var deferred = $q.defer();
                    
                    api_service.send('user.getListId',{
                        search:search, filter:{p:p,n:n},
                        exclude:exclude, 
                        page_id :  page_id, 
                        role : role,
                        page_type : page_type,
                        order : random ? { type : 'random', seed : random } : null 
                    })
                        .then(function(d){
                            user_model.get(d.list).then(function(){
                                deferred.resolve( d );
                            },function(){
                                console.log('Search All Problem: get users', arguments);
                                deferred.reject();
                            });
                        },function(){
                            console.log('Search All Problem', arguments);
                            deferred.reject();
                        });
                        
                    return deferred.promise;
                },
                checkEmails: function(emails){
                    return api_service.send('user.getListIdByEmail',{email : emails});
                },
                connections: function( search, p, n, exclude ){
                    var deferred = $q.defer();
                    
                    api_service.queue('user.getListId',{search:search,exclude:exclude,filter:{p:p,n:n,o:{"user$contact_state":"ASC"}},contact_state:[3]})
                        .then(function(d){
                            user_model.get(d.list).then(function(){
                                deferred.resolve( d.list );
                            },function(){
                                console.log('Search Cncts Problem: get users', arguments);
                                deferred.reject();
                            });
                        },function(){
                            console.log('Search Cncts Problem', arguments);
                            deferred.reject();
                        });
                        
                    return deferred.promise;
                }, 
                subscriptions: function( page_id, p, n, search  ){
                    var deferred = $q.defer();
                    api_service.queue('page.getListSuscribersId',{ id : page_id, search:search,filter:{p:p,n:n}})
                        .then(function(d){
                            user_model.get(d.list).then(function(){
                                deferred.resolve( d );
                            },function(){
                                console.log('Search Cncts Problem: get users', arguments);
                                deferred.reject();
                            });
                        },function(){
                            console.log('Search Cncts Problem', arguments);
                            deferred.reject();
                        });
                        
                    return deferred.promise;
                }, 
                pages: function( search, p, n, type, parent_id, exclude, start_date, end_date, strict ){
                    var deferred = $q.defer();
                    
                    api_service.queue('page.getListId',
                    {
                        search:search,
                        filter:{p:p,n:n,o:{"page$id":"DESC"}},
                        parent_id:parent_id,
                        type : type,
                        exclude : exclude,
                        start_date : start_date,
                        end_date : end_date,
                        strict_dates : strict
                    })
                        .then(function(d){
                            page_model.get(d.list).then(function(){
                                deferred.resolve( d );
                            },function(){
                                console.log('Search page problem: get pages', arguments);
                                deferred.reject();
                            });
                        },function(){
                            console.log('Search page problem: get pages', arguments);
                            deferred.reject();
                        });
                        
                    return deferred.promise;
                },                
               
            };
            
            return service;
        }
    ]);