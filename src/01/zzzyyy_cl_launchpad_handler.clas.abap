CLASS zzzyyy_cl_launchpad_handler DEFINITION
  PUBLIC
  FINAL
  CREATE PUBLIC .

  PUBLIC SECTION.

    INTERFACES if_http_extension.

  PROTECTED SECTION.
  PRIVATE SECTION.
ENDCLASS.



CLASS zzzyyy_cl_launchpad_handler IMPLEMENTATION.

  METHOD if_http_extension~handle_request.

    zzzyyy_cl_http_handler=>factory( server )->main( ).

  ENDMETHOD.

ENDCLASS.
