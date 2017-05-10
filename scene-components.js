// UCLA's Graphics Example Code (Javascript and C++ translations available), by Garett for CS174a.
// example-scene-components.js - The Scene_Component subclasses defined here describe different independent animation processes that you 
// want to fire off each frame, by defining a display event and how to react to key and mouse input events.  Create your own subclasses, 
// and fill them in with all your shape drawing calls and any extra key / mouse controls.

  // **********************************************************************************
  // First go down to the following class's display() method to see where the sample 
  // shapes you see drawn are coded, and a good place to begin filling in your own code.

Declare_Any_Class( "Debug_Screen",  // Debug_Screen - An example of a Scene_Component that our Canvas_Manager can manage.  Displays a text user interface.
  { 'construct'( context )
      { this.define_data_members( { string_map:    context.globals.string_map, start_index: 0, tick: 0, visible: false, graphics_state: new Graphics_State(),
                                    text_material: context.shaders_in_use["Phong_Model"].material( 
                                                                                Color(  0, 0, 0, 1 ), 1, 0, 0, 40, context.textures_in_use["text.png"] ) } );
        var shapes = { 'debug_text': new Text_Line( 35 ),
                       'cube':   new Cube() };
        this.submit_shapes( context, shapes );
      },
    'init_keys'( controls )
      { controls.add( "t",    this, function() { this.visible ^= 1;                                                                                                  } );
        controls.add( "up",   this, function() { this.start_index = ( this.start_index + 1 ) % Object.keys( this.string_map ).length;                                } );
        controls.add( "down", this, function() 
                                    { this.start_index = ( this.start_index - 1   + Object.keys( this.string_map ).length ) % Object.keys( this.string_map ).length; } );
        this.controls = controls;
      },
    'update_strings'( debug_screen_object )   // Strings that this Scene_Component contributes to the UI:
      { debug_screen_object.string_map["tick"]              = "Frame: " + this.tick++;
        debug_screen_object.string_map["text_scroll_index"] = "Text scroll index: " + this.start_index;
      },
    'display'( global_graphics_state )    // Leave these 3D global matrices unused, because this class is instead making a 2D user interface.
      { if( !this.visible ) return;
        var font_scale = scale( .02, .04, 1 ),
            model_transform = mult( translation( -.95, -.9, 0 ), font_scale ),
            strings = Object.keys( this.string_map );
  
        for( var i = 0, idx = this.start_index; i < 4 && i < strings.length; i++, idx = (idx + 1) % strings.length )
        { this.shapes.debug_text.set_string( this.string_map[ strings[idx] ] );
          this.shapes.debug_text.draw( this.graphics_state, model_transform, this.text_material );  // Draw some UI text (each live-updated 
          model_transform = mult( translation( 0, .08, 0 ), model_transform );                      // logged value in each Scene_Component)
        }
        model_transform   = mult( translation( .7, .9, 0 ), font_scale );
        this.  shapes.debug_text.set_string( "Controls:" );
        this.  shapes.debug_text.draw( this.graphics_state, model_transform, this.text_material );  // Draw some UI text

        for( let k of Object.keys( this.controls.all_shortcuts ) )
        { model_transform = mult( translation( 0, -0.08, 0 ), model_transform );
          this.shapes.debug_text.set_string( k );
          this.shapes.debug_text.draw( this.graphics_state, model_transform, this.text_material );  // Draw some UI text (the canvas's key controls)
        }
      }
  }, Scene_Component );

Declare_Any_Class( "Example_Camera",                  // An example of a Scene_Component that our Canvas_Manager can manage.  Adds both first-person and
  { 'construct'( context, canvas = context.canvas )   // third-person style camera matrix controls to the canvas.
      { // 1st parameter below is our starting camera matrix.  2nd is the projection:  The matrix that determines how depth is treated.  It projects 3D points onto a plane.
        context.globals.graphics_state.set( translation(0, 0, -8/*0, 0, -25*/), perspective(45, context.width/context.height, 0.1, 1000), 0 );
        this.define_data_members( { graphics_state: context.globals.graphics_state, thrust: vec3(), origin: vec3( 0, 5, 0 ), looking: false } );

        // *** Mouse controls: ***
        this.mouse = { "from_center": vec2() };                           // Measure mouse steering, for rotating the flyaround camera:
        var mouse_position = function( e ) { return vec2( e.clientX - context.width/2, e.clientY - context.height/2 ); };   
        canvas.addEventListener( "mouseup",   ( function(self) { return function(e) 
                                                                      { e = e || window.event;    self.mouse.anchor = undefined;              } } ) (this), false );
        canvas.addEventListener( "mousedown", ( function(self) { return function(e) 
                                                                      { e = e || window.event;    self.mouse.anchor = mouse_position(e);      } } ) (this), false );
        canvas.addEventListener( "mousemove", ( function(self) { return function(e) 
                                                                      { e = e || window.event;    self.mouse.from_center = mouse_position(e); } } ) (this), false );
        canvas.addEventListener( "mouseout",  ( function(self) { return function(e) { self.mouse.from_center = vec2(); }; } ) (this), false );  // Stop steering if the 
      },                                                                                                                                        // mouse leaves the canvas.
    'init_keys'( controls )   // init_keys():  Define any extra keyboard shortcuts here
      { controls.add( "Space", this, function() { this.thrust[1] = -1; } );     controls.add( "Space", this, function() { this.thrust[1] =  0; }, {'type':'keyup'} );
        controls.add( "z",     this, function() { this.thrust[1] =  1; } );     controls.add( "z",     this, function() { this.thrust[1] =  0; }, {'type':'keyup'} );
        controls.add( "w",     this, function() { this.thrust[2] =  1; } );     controls.add( "w",     this, function() { this.thrust[2] =  0; }, {'type':'keyup'} );
        controls.add( "a",     this, function() { this.thrust[0] =  1; } );     controls.add( "a",     this, function() { this.thrust[0] =  0; }, {'type':'keyup'} );
        controls.add( "s",     this, function() { this.thrust[2] = -1; } );     controls.add( "s",     this, function() { this.thrust[2] =  0; }, {'type':'keyup'} );
        controls.add( "d",     this, function() { this.thrust[0] = -1; } );     controls.add( "d",     this, function() { this.thrust[0] =  0; }, {'type':'keyup'} );
        controls.add( ",",     this, function() { this.graphics_state.camera_transform = mult( rotation( 6, 0, 0,  1 ), this.graphics_state.camera_transform ); } );
        controls.add( ".",     this, function() { this.graphics_state.camera_transform = mult( rotation( 6, 0, 0, -1 ), this.graphics_state.camera_transform ); } );
        controls.add( "o",     this, function() { this.origin = mult_vec( inverse( this.graphics_state.camera_transform ), vec4(0,0,0,1) ).slice(0,3)         ; } );
        controls.add( "r",     this, function() { this.graphics_state.camera_transform = identity()                                                           ; } );
        controls.add( "f",     this, function() { this.looking  ^=  1; } );
      },
    'update_strings'( user_interface_string_manager )   // Strings that this Scene_Component contributes to the UI:
      { var C_inv = inverse( this.graphics_state.camera_transform ), pos = mult_vec( C_inv, vec4( 0, 0, 0, 1 ) ),
                                                                  z_axis = mult_vec( C_inv, vec4( 0, 0, 1, 0 ) );
        user_interface_string_manager.string_map["origin" ] = "Center of rotation: " 
                                                              + this.origin[0].toFixed(0) + ", " + this.origin[1].toFixed(0) + ", " + this.origin[2].toFixed(0);
        user_interface_string_manager.string_map["cam_pos"] = "Cam Position: "
                                                              + pos[0].toFixed(2) + ", " + pos[1].toFixed(2) + ", " + pos[2].toFixed(2);    
        user_interface_string_manager.string_map["facing" ] = "Facing: " + ( ( z_axis[0] > 0 ? "West " : "East ")             // (Actually affected by the left hand rule)
                                                               + ( z_axis[1] > 0 ? "Down " : "Up " ) + ( z_axis[2] > 0 ? "North" : "South" ) );
      },
    'display'( graphics_state )
      { var leeway = 70,  degrees_per_frame = .0004 * graphics_state.animation_delta_time,
                          meters_per_frame  =   .01 * graphics_state.animation_delta_time;
        if( this.mouse.anchor )                                                         // Third-person "arcball" camera mode: Is a mouse drag occurring?
        { var dragging_vector = subtract( this.mouse.from_center, this.mouse.anchor );  // Spin the scene around the world origin on a user-determined axis.
          if( length( dragging_vector ) > 0 )
            graphics_state.camera_transform = mult( graphics_state.camera_transform,    // Post-multiply so we rotate the scene instead of the camera.
                mult( translation( this.origin ),
                mult( rotation( .05 * length( dragging_vector ), dragging_vector[1], dragging_vector[0], 0 ),
                      translation(scale_vec( -1, this.origin ) ) ) ) );
        }
        // First-person flyaround mode:  Determine camera rotation movement when the mouse is past a minimum distance (leeway) from the canvas's center.
        var offsets = { plus:  [ this.mouse.from_center[0] + leeway, this.mouse.from_center[1] + leeway ],
                        minus: [ this.mouse.from_center[0] - leeway, this.mouse.from_center[1] - leeway ] };
        if( this.looking ) 
          for( var i = 0; i < 2; i++ )      // Steer according to "mouse_from_center" vector, but don't start increasing until outside a leeway window from the center.
          { var velocity = ( ( offsets.minus[i] > 0 && offsets.minus[i] ) || ( offsets.plus[i] < 0 && offsets.plus[i] ) ) * degrees_per_frame;  // &&'s might zero these out.
            graphics_state.camera_transform = mult( rotation( velocity, i, 1-i, 0 ), graphics_state.camera_transform );   // On X step, rotate around Y axis, and vice versa.
          }     // Now apply translation movement of the camera, in the newest local coordinate frame
        graphics_state.camera_transform = mult( translation( scale_vec( meters_per_frame, this.thrust ) ), graphics_state.camera_transform );
      }
  }, Scene_Component );

Declare_Any_Class( "Flag_Toggler",  // A class that just interacts with the keyboard and reports strings
  { 'construct'( context ) { this.globals    = context.globals; },
    'init_keys'( controls )   //  Desired keyboard shortcuts
      { controls.add( "ALT+g", this, function() { this.globals.graphics_state.gouraud       ^= 1; } );   // Make the keyboard toggle some
        controls.add( "ALT+n", this, function() { this.globals.graphics_state.color_normals ^= 1; } );   // GPU flags on and off.
        controls.add( "ALT+a", this, function() { this.globals.animate                      ^= 1; } );
      },
    'update_strings'( user_interface_string_manager )   // Strings that this Scene_Component contributes to the UI:
      { user_interface_string_manager.string_map["time"]    = "Animation Time: " + Math.round( this.globals.graphics_state.animation_time )/1000 + "s";
        user_interface_string_manager.string_map["animate"] = "Animation " + (this.globals.animate ? "on" : "off") ;
      },
  }, Scene_Component );
  

  // DISCLAIMER:  The collision method shown below is not used by anyone; it's just very quick to code.  Making every collision body a stretched sphere is kind 
  // of a hack, and looping through a list of discrete sphere points to see if the volumes intersect is *really* a hack (there are perfectly good analytic 
  // expressions that can test if two ellipsoids intersect without discretizing them into points).   On the other hand, for non-convex shapes you're usually going
  // to have to loop through a list of discrete tetrahedrons defining the shape anyway.

Declare_Any_Class( "Fox",
  { 'construct'( context, min )
      { 
        // *** Materials: *** Declare new ones as temps when needed; they're just cheap wrappers for some numbers.  1st parameter:  Color (4 floats in RGBA format),
        // 2nd: Ambient light, 3rd: Diffuse reflectivity, 4th: Specular reflectivity, 5th: Smoothness exponent, 6th: Optional texture object, leave off for un-textured.
        this.define_data_members( { position	: vec3(0, 0, 0),
                                    velocity	: vec3(0, 0, -50),
                                    z_min		: min,
									orange		: context.shaders_in_use["Phong_Model" ].material( Color( 1, .423, .212, 1 ), .4, .8, .1, 40 ),
                                    white		: context.shaders_in_use["Phong_Model" ].material( Color( 1, .933, .812, 1 ), .4, .8, .1, 40 ),
                                    purple		: context.shaders_in_use["Phong_Model" ].material( Color( .486, .118, .33, 1 ), .4, .8, .1, 40 ),
									                  black		  : context.shaders_in_use["Phong_Model" ].material( Color( .235, .15, .28, 1 ), .4, .8, .1, 40 )
                                  } );
                                   
		var shapes = { 'upper_face'     : smooth_to_flat(new Upper_Face()),
                       'lower_face'		: smooth_to_flat(new Lower_Face()),
					   'face_side'		: smooth_to_flat(new Face_Side()),
					   'nose'			: new Triangle(),
					   'eye_square'		: new Square(),
                       'sad_mouth'      : smooth_to_flat(new Mouth( 1 )),
					   'ear_top'		: smooth_to_flat(new Ear_Top()),
					   'ear_bot'		: smooth_to_flat(new Ear_Bot()),
					   'ear_inner'		: smooth_to_flat(new Ear_Inner()),
					   'back_head_side'	: smooth_to_flat(new Back_Head_Side()),
					   'back_head'		: smooth_to_flat(new Back_Head()),
					   'body_part1'		: smooth_to_flat(new Body_Part1()),
					   'body_part2'		: smooth_to_flat(new Body_Part2()),
					   'body_part3'		: smooth_to_flat(new Body_Part3()),
					   'body_part4'		: smooth_to_flat(new Body_Part4()),
					   'tail'			: smooth_to_flat(new Tail())
                    };
		this.submit_shapes( context, shapes );
      },
    'advance'( time_amount )
      { var dt = time_amount / 1000;
        for (var i = 0; i < 3; ++i)
          this.position[i] += this.velocity[i] * dt;
        if (this.position[2] < this.z_min) this.position[2] = 0;
        this.velocity[1] -= dt * 9.8;
        if (this.velocity[0] > 0)
          this.velocity[0] -= dt * 5;
        else if (this.velocity[0] < 0)
          this.velocity[0] += dt * 5;
      },
    'pos'()
      { return this.position;
      },
    'add_velocity'( x, y, z)
      { this.velocity[0] += x;
        this.velocity[1] = y;
        this.velocity[2] += z;
      },
	'draw'( graphics_state, transform ) {
		var original = transform;
		this.draw_head( graphics_state, transform );
		transform = mult(transform, translation(0, -.4, -1));
			transform = mult(transform, rotation(-20, 1, 0, 0));
				this.shapes.body_part1.draw(graphics_state, transform, this.orange);
					transform = mult(transform, translation(0, 0, -1));
						this.shapes.body_part2.draw(graphics_state, transform, this.orange);
							transform = mult(transform, translation(0, 0, -1.2));
								var angle = -10 * this.velocity[1];
								var dy = angle > 0 ? .4 : .8;
								transform = mult(transform, translation(0, dy, 0));
								transform = mult(transform, rotation(angle, 1, 0, 0));
								transform = mult(transform, translation(0, -dy, 0));
									this.shapes.body_part3.draw(graphics_state, transform, this.orange);
										transform = mult(transform, translation(0, 0, -.6));
											this.shapes.body_part4.draw(graphics_state, transform, this.orange);
												transform = mult(transform, translation(0, 0, -1));

																this.shapes.tail.draw(graphics_state, transform, this.white);
								
	  },
	'draw_head'( graphics_state, transform) {
		var original = transform;

        this.shapes.upper_face.draw(graphics_state, transform, this.orange);
        this.shapes.lower_face.draw(graphics_state, transform, this.white);
		this.shapes.face_side.draw(graphics_state, transform, this.orange);

		this.draw_eyes( graphics_state, transform );
		this.draw_nose( graphics_state, transform );
		this.draw_mouth( graphics_state, transform );

		transform = mult(transform, translation(.5,.5,0));
			transform = mult(transform, rotation(45, 0, 1, 0));
				transform = mult(transform, rotation(20, 1, 0, 0));
					transform = mult(transform, rotation(-20, 0, 0, 1));
						this.draw_ear( graphics_state, transform );
		transform = original;
		transform = mult(transform, translation(-.5, .5, 0));
			transform = mult(transform, rotation(-45, 0, 1, 0));
				transform = mult(transform, rotation(20, 1, 0, 0));
					transform = mult(transform, rotation(20, 0, 0, 1));
						transform = mult(transform, scale(-1, 1, 1));
							this.draw_ear( graphics_state, transform );
		
		transform = original;
		transform = mult(transform, translation(0, 0, -.8));
		this.shapes.back_head_side.draw(graphics_state, transform, this.orange);
			this.shapes.back_head.draw(graphics_state, transform, this.orange);

	  },
	'draw_eyes'( graphics_state, transform ) {
		var original = transform;
		transform = mult(transform, transform_to_triangle_center(vec3(.4,0,.3), vec3(1.8,-.3,0), vec3(1.2,.8,0), .01));
			transform = mult(transform, translation(-.3, .1, 0));
				transform = mult(transform, rotation(-10, 0, 0, 1));
					transform = mult(transform, rotation(180, 0, 1, 0));
						transform = mult(transform, scale(.08, .16, 1));
		this.shapes.eye_square.draw(graphics_state, transform, this.black);
		transform = original;
		transform = mult(transform, transform_to_triangle_center(vec3(-.4,0,.3), vec3(-1.2,.8,0), vec3(-1.8,-.3,0), .01));
			transform = mult(transform,translation(.3, .1, 0));
				transform = mult(transform, rotation(10, 0, 0, 1));
					transform = mult(transform, rotation(180, 0, 1, 0));
						transform = mult(transform, scale(.08, .16, 1));
		this.shapes.eye_square.draw(graphics_state, transform, this.black);
	  },
	'draw_nose'( graphics_state, transform ) {
		transform = mult(transform, transform_to_triangle_center(vec3(-.2,.5,.4), vec3(.4,0,.3), vec3(.2,.5,.4), .001));
			transform = mult(transform,translation(-.4/3, .5/3-1/Math.sqrt(2)*.2, 0));
				transform = mult(transform, scale(.4/Math.sqrt(2), .2, 1));
					transform = mult(transform, rotation(180, 0, 1, 0));
						transform = mult(transform, rotation(45, 0, 0, 1));
		this.shapes.nose.draw(graphics_state, transform, this.black);
	  },
	'draw_mouth'( graphics_state, transform ) {
		transform = mult(transform, transform_to_triangle_center(vec3(-.2,.5,.4), vec3(.4,0,.3), vec3(.2,.5,.4), .001));
			transform = mult(transform,translation(-.4/3, -.4 , 0));
				transform = mult(transform, scale(.15, .15, 1));
		this.shapes.sad_mouth.draw(graphics_state, transform, this.purple);
	  },
	'draw_ear'( graphics_state, transform ) {
		transform = mult(transform, translation(.2, .2 , .01));
			this.shapes.ear_inner.draw(graphics_state, transform, this.white);
		transform = mult(transform, translation(-.2, -.2 , -.01));
		this.shapes.ear_bot.draw(graphics_state, transform, this.orange);
		this.shapes.ear_top.draw(graphics_state, transform, this.purple);
	  }
		
  }, Scene_Component );
  

Declare_Any_Class( "Flapping_Fox",
  { 'construct'( context )
      { // context.globals.graphics_state.set( translation(0, 0, -25), perspective(45, context.width/context.height, 0.1, 1000), 0);
        var l = 100;
        // *** Materials: *** Declare new ones as temps when needed; they're just cheap wrappers for some numbers.  1st parameter:  Color (4 floats in RGBA format),
        // 2nd: Ambient light, 3rd: Diffuse reflectivity, 4th: Specular reflectivity, 5th: Smoothness exponent, 6th: Optional texture object, leave off for un-textured.
        this.define_data_members( { graphics_state: context.globals.graphics_state,
                                    ratio        : context.width/context.height,
                                    tunnel_wall  : context.shaders_in_use["Phong_Model" ].material( Color( .09, .125, .3, 1 ), 1, 1, .4, 1 ),   // Smaller exponent means 
                                    tunnel_line  : context.shaders_in_use["Phong_Model" ].material( Color( .17, .17, .17, 1 ), 1, 1, .4, 1 ),
                                    tunnel_light : context.shaders_in_use["Phong_Model" ].material( Color( .8, .8, .8, 1 ), .4, .8, .1, 40 ),
                                    door         : context.shaders_in_use["Phong_Model" ].material( Color( .35, .56, .91, 1 ), .1, .8, .1, 40 ),
                                    fox_color    : context.shaders_in_use["Phong_Model" ].material( Color( .8, .8, .8, 1 ), .4, .8, .1, 40 ),
                                    prevdoor     : context.shaders_in_use["Phong_Model" ].material( Color( 0,0, 0,.1 ), 1, 0, 0, 40 ),     // a bigger shiny spot.
                                  
                                    tunnel_r     : 7,
                                    tunnel_l     : l,
                                    tunnel_line_r: 1,
                                    tunnel_light_r:.5,
                                    tunnel_light_d:15,
                                    door_thick   : 1,
                                    hole_r       : 2,
                                    hole_pos_max : 4,
                                    hole_x       : 0,
                                    hole_y       : 0,
                                    hole_passing_r : 1.5,

                                    fox      	 : new Fox(context,  -l / 2),
                                    
                                    first_time   : true,
                                    prev_t       : 0,
                                    running      : false,
                                    hole_updated : false,
                                    crash_wall   : 6,
                                    crash_line   : 2,
                                    crashed      : false
                                  } );
        var shapes = { 'tube'           : new Cylindrical_Tube(10,1000),
                       'ball'			      : new Grid_Sphere(30, 30),
                       'capped_cylinder': new Capped_Cylinder(10,1000),
                       'donut'          : new Torus_rR_Specified( 100, 100, this.tunnel_r, this.tunnel_light_r ),
                       'hole'           : new Torus_rR_Specified( 100, 100, this.hole_r, .1 )
                    };
        this.submit_shapes( context, shapes );
      },
    'init_keys'( controls )
      { controls.add( "space",     this, function() { if (this.running) this.fox.add_velocity(0, 7, 0) } );
        controls.add( "left",      this, function() { if (this.running) this.fox.add_velocity(-5, 0, 0) } );
        controls.add( "right",     this, function() { if (this.running) this.fox.add_velocity(5, 0, 0) } );
      },
    'display'( graphics_state )
      { var t = graphics_state.animation_time/1000;
		//console.log(graphics_state.animation_delta_time);
        if (t > this.prev_t && !this.crashed) {
          this.running = true;
          this.prev_t = t;
        }
        else this.running = false;
        
        var pos = this.fox.pos();
        if (this.collide(pos[0], pos[1]) == true)
          this.crashed = true;
        
        if (pos[2] < -this.tunnel_l / 2 + .5) {
          this.first_time = false;
          if (!this.hole_updated) {
            if (!this.passed_hole(pos[0], pos[1])) {
              this.crashed = true;
            } else {
              var R = this.hole_pos_max * Math.random();
              var rad = radians(360 * Math.random());
              this.hole_x = R * Math.cos(rad);
              this.hole_y = R * Math.sin(rad);
              this.hole_updated = true;
            }
          }
        }
        else this.hole_updated = false;
        if (t == 0 || this.running) graphics_state.camera_transform = lookAt(vec3(pos[0], 5, pos[2]+15), pos, vec3(0, 1, 0));
		//if (t == 0 || this.running) graphics_state.camera_transform = lookAt(vec3(-4.5, 5, 4.2), vec3(0, 0, 1), vec3(0, 1, 0));
		// *** Lights: *** Values of vector or point lights over time.  Two different lights *per shape* supported; more requires changing a number in the vertex shader.
        graphics_state.lights = [ new Light( vec4( 0, 5, pos[2] + 5, 1 ), Color( 0, 0, 0, 1 ), 10000 ),      // Arguments to construct a Light(): Light source position or 
                                  new Light( vec4( 0, -5, pos[2], 1 ), Color( 0, 0, 0, 1 ), 10000 )
								    ];    // vector (homogeneous coordinates), color, and size.  
        
        this.tunnel(graphics_state);
        this.next_door(graphics_state);
        
        if (this.running && !this.crashed) {
			this.fox.advance( graphics_state.animation_delta_time );
			//console.log(graphics_state.animation_delta_time);
		}
		var transform = identity();
		transform = mult(transform, translation(pos));
        	transform = mult(transform, rotation(180, 0, 1, 0));
				transform = mult(transform, scale(.5, .5, .5));
					this.fox.draw( graphics_state, transform );

        if (!this.first_time) this.prev_door(graphics_state);
	  },
    'collide'( x, y )
      { if (x * x + y * y > Math.pow(this.crash_wall, 2)) return true;
        if (Math.pow(x - this.tunnel_r, 2) + y * y < Math.pow(this.crash_line, 2)) return true;
        if (Math.pow(x + this.tunnel_r, 2) + y * y < Math.pow(this.crash_line, 2)) return true;
        return false;
      },
    'passed_hole'( x, y )
      { return (Math.pow(x - this.hole_x, 2) + Math.pow(y - this.hole_y, 2) <= Math.pow(this.hole_passing_r, 2));
      },
    'tunnel'( graphics_state )
      {
        var transform = identity();
        transform = mult(transform, scale(this.tunnel_line_r, this.tunnel_line_r, this.tunnel_l));
        this.shapes.tube.draw(graphics_state, mult(transform, translation(this.tunnel_r, 0, 0)), this.tunnel_line);
        this.shapes.tube.draw(graphics_state, mult(transform, translation(-this.tunnel_r, 0, 0)), this.tunnel_line);
        this.shapes.tube.draw(graphics_state, scale(this.tunnel_r, this.tunnel_r, this.tunnel_l), this.tunnel_wall);
        var position = 20;
        while (position > -this.tunnel_l) {
          this.shapes.donut.draw(graphics_state, translation(0, 0, position), this.tunnel_light);
          position -= this.tunnel_light_d;
        }
      },
    'next_door'( graphics_state )
      { var transform = identity();
        transform = mult(transform, translation(0, 0, -this.tunnel_l / 2));
          transform = mult(transform, scale(this.tunnel_r, this.tunnel_r, this.door_thick));
            this.shapes.capped_cylinder.draw(graphics_state, transform, this.door);
          transform = mult(transform, scale(1/this.tunnel_r, 1/this.tunnel_r, 1/this.door_thick));
          transform = mult(transform, translation(this.hole_x, this.hole_y, 1));
            this.shapes.hole.draw(graphics_state, transform, this.tunnel_light);
      },
    'prev_door'( graphics_state )
      {
        var transform = identity();
        transform = mult(transform, scale(this.tunnel_r * .9, this.tunnel_r * .9, 0.2));
        this.shapes.capped_cylinder.draw(graphics_state, transform, this.prevdoor);
      }
  }, Scene_Component );
