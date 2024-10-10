CLASS z2ui6_cl_lp_sample_04 DEFINITION PUBLIC.

  PUBLIC SECTION.

    INTERFACES z2ui6_if_app.

    DATA product  TYPE string.
    DATA product_url  TYPE string.
    DATA quantity TYPE string.
    DATA check_initialized TYPE abap_bool.
    DATA check_launchpad_active TYPE abap_bool.

  PROTECTED SECTION.
  PRIVATE SECTION.
ENDCLASS.



CLASS z2ui6_cl_lp_sample_04 IMPLEMENTATION.


  METHOD z2ui6_if_app~main.

    DATA(view) = z2ui6_cl_xml_view=>factory( ).
    product_url = z2ui6_cl_util=>url_param_get(
                    val =  `product`
                    url = client->get( )-s_config-search ).
    check_launchpad_active = client->get( )-check_launchpad_active.

    data(lt_params) = client->get( )-t_comp_params.
    try.
    product = lt_params[ n = `PRODUCT` ]-v.
    catch cx_root.
    endtry.
    IF check_initialized = abap_false.
      check_initialized = abap_true.

      quantity = '500'.

      client->view_display( view->shell(
            )->page(
                    showheader       = xsdbool( abap_false = client->get( )-check_launchpad_active )
                    title          = 'abap2UI5 -  Cross App Navigation App 128'
                    navbuttonpress = client->_event( val = 'BACK' )
                    shownavbutton = xsdbool( client->get( )-s_draft-id_prev_app_stack IS NOT INITIAL )
                )->header_content(
                    )->link(
                        text = 'Source_Code'

                        target = '_blank'
                )->get_parent(
                )->simple_form( title = 'App 128' editable = abap_true
                    )->content( 'form'
                        )->title( 'Input'
                        )->label( 'product nav param'
                        )->input( client->_bind_edit( product )
                        )->label( `CHECK_LAUNCHPAD_ACTIVE`
                        )->input( check_launchpad_active
                        )->button( press = client->_event(  )
                        )->button( text = 'BACK' press = client->_event_client( client->cs_event-cross_app_nav_to_prev_app )
                        )->button(
                            text  = 'go to app 127'
                            press = client->_event_client(
            val    = client->cs_event-cross_app_nav_to_ext
            t_arg  = VALUE #( ( `{ semanticObject: "Z2UI6_CL_LP_SAMPLE_03",  action: "display" }` ) ( `{ ProductID : "123234" }`) )
        )
             )->stringify( ) ).

    ENDIF.

    client->view_model_update( ).

    CASE client->get( )-event.

      WHEN 'BUTTON_POST'.

*        client->message_toast_display( |{ product } { quantity } - send to the server| ).

      WHEN 'BACK'.
        client->nav_app_leave( client->get_app( client->get( )-s_draft-id_prev_app_stack  ) ).

    ENDCASE.

  ENDMETHOD.
ENDCLASS.
