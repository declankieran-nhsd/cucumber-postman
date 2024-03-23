Feature: Patient provides consent to share information
  A patient or their advocate provides consent to share information for 
  the Reasonable Adjustments programme.

  Background:
    Given a patient exists in a FHIR server at url "http://localhost:8080/fhir"
    And a practitioner exists in a FHIR server at url "http://localhost:8080/fhir"
    And associated packages/FHIR assets are available to the FHIR server

  Scenario: Consent to share information
    Given a patient or their advocate provides consent
    When the consent is recorded
    Then it will be linked to the patient

  Scenario: Consent is given and recorded where no consent existed previously
    Given a patient or their advocate provides consent
    When the consent is recorded
    Then it will be created on the FHIR server if it did not previously exist
    And the consent status will be set to "active"

  Scenario: Consent is given and recorded where consent was previously revoked
    Given a patient or their advocate provides consent
    When the consent is recorded
    Then the consent statue will be set to "active"
    And the provision putpose will be set to "RACONSENT"

  Scenario: The Consent category reflects the patient consent is for Reasonable Adjustments 
    Given a patient or their advocate provides consent
    When the consent is recorded
    Then the consent category will be set to "NRAF"

  Scenario: The Consent provision purpose reflects consent has been given  
    Given a patient or their advocate provides consent
    When the consent is recorded
    Then the provision putpose will be set to "RACONSENT"

  Scenario: The consent is given specifically by the patient
    Given a patient provides consent
    When the consent is recorded
    Then the proxyRule will be set to a code from "https://fhir.nhs.uk/England/CodeSystem/FlagProxyRole"
    And the proxyRule will be set to the code "001"

  Scenario: The consent is given specifically by the patient advocate
    Given a patient advocate provides consent
    When the consent is recorded
    Then the proxyRule will be set to a code from "https://fhir.nhs.uk/England/CodeSystem/FlagProxyRole"
    And the proxyRule will NOT be set to the code "001"

  Scenario: Freetext notes are required for the consent on creation
    Given a patient or their advocate provides consent
    And the practitioner must add notes to the consent
    When the consent is recorded
    Then notes be recorded along with the consent object

  # TODO maybe put provenance into a separate feature
  Scenario: The details of who obtained the consent will be recorded
    Given a patient or their advocate provides consent
    When the consent is recorded
    Then the details of who obtained the consent will be recorded
    And role code will be set to a code from "https://fhir.hl7.org.uk/STU3/CodeSystem/CareConnect-SDSJobRoleName-1"
