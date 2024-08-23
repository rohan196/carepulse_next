"use client"
 
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl } from "@/components/ui/form"
import CustomFormField from "../CustomFormField"
import SubmitButton from "../SubmitButton"
import { useState } from "react"
import { PatientFormValidation, UserFormValidation } from "@/lib/validation"
import { useRouter } from "next/navigation"
import { createUser, getUser, registerPatient } from "@/lib/actions/patient.actions"
import { FormFieldType } from "./PatientForm"
import { fields } from "@hookform/resolvers/ajv/src/__tests__/__fixtures__/data.js"
// import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { Doctors, GenderOptions, IdentificationTypes, PatientFormDefaultValues } from "@/constants"
import { Label } from "@radix-ui/react-label"
import { SelectItem } from "@/components/ui/select"
import Image from "next/image"
import FileUploader from "../FileUploader"
import { register } from "module"

const RegisterForm = ({user}: {user: User}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // 1. Define your form.
  const form = useForm<z.infer<typeof PatientFormValidation>>({
    resolver: zodResolver(PatientFormValidation),
    defaultValues: {
      ...PatientFormDefaultValues,
      name: "",
      email: "",
      phone: "",
    },
  })
 
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof PatientFormValidation>) {
    setIsLoading(true);

    let formData;

    if(values.identificationDocument && values.identificationDocument?.length > 0) {
        const blobFile = new Blob([values.identificationDocument[0]], {
            type: values.identificationDocument[0].type,  
        });

        formData = new FormData();
        formData.append('blobFile', blobFile);
        formData.append('fileName', values.identificationDocument[0].name)
    }

    try {
        const patientData = {
            ...values,
            // Specifying only those fields that change (need to be modified)
            userId: user.$id,
            birthDate: new Date(values.birthDate),
            identificationDocument: formData,
        }
        
        //@ts-ignore
        const newPatient = await registerPatient(patientData);

        if(newPatient) {
            // router.push(`/patients/${user.$id}/new-appointment`);
            router.push(`/patients/${user.$id}/new-appointment`);
        }
    } catch (error) {
        console.log(error);
    }
    setIsLoading(false);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12 flex-1">
        <section className="space-y-4">
            <h1 className="header">Welcome 👋</h1>
            <p className="text-dark-700">Let us know more about yourself</p>
        </section>
        <section className="space-y-6">
            <div className="mb-9 space-y-1">
                <h2 className="sub-header">Personal Information</h2>
            </div>
        </section>
        <CustomFormField 
         fieldType={FormFieldType.INPUT}
         control={form.control}
         name='name'
         label="Full Name"
         placeholder='John Doe'
         iconSrc='/assets/icons/user.svg'
         iconAlt='user'
        />
        <div className="flex flex-col gap-6 xl:flex-row">
            <CustomFormField 
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name='email'
            label='Email'
            placeholder='johndoe@gmail.com'
            iconSrc='/assets/icons/email.svg'
            iconAlt='email'
            />
            <CustomFormField 
            fieldType={FormFieldType.PHONE_INPUT}
            control={form.control}
            name='phone'
            label='Phone number'
            placeholder='7424870565'
            />
        </div>
        <div className="flex flex-col gap-6 xl:flex-row">
            <CustomFormField 
                fieldType={FormFieldType.DATE_PICKER}
                control={form.control}
                name='birthDate'
                label='Date of Birth'
                />
                <CustomFormField
                fieldType={FormFieldType.SKELETON}
                control={form.control}
                name="gender"
                label="Gender"
                renderSkeleton={(field) => (
                    <FormControl>
                    <RadioGroup
                        className="flex h-11 gap-6 xl:justify-between"
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                    >
                        {GenderOptions.map((option, i) => (
                        <div key={option + i} className="radio-group">
                            <RadioGroupItem value={option} id={option} />
                            <Label htmlFor={option} className="cursor-pointer">
                            {option}
                            </Label>
                        </div>
                        ))}
                    </RadioGroup>
                    </FormControl>
                )}
                />
        </div>
        <div className="flex flex-col gap-6 xl:flex-row">
        <CustomFormField 
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name='address'
            label='Address'
            placeholder='14th Street, New York'
        />
        <CustomFormField 
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name='occupation'
            label='Occupation'
            placeholder='Software Engineer'
        />
        </div>
        <div className="flex flex-col gap-6 xl:flex-row">
        <CustomFormField 
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name='emergencyContactName'
            label='Emergency Contact Name'
            placeholder="Guardian's Name"
            />
            <CustomFormField 
            fieldType={FormFieldType.PHONE_INPUT}
            control={form.control}
            name='emergencyContactNumber'
            label='Emergency Contact Number'
            placeholder='7424870565'
            />
        </div>
        <section className="space-y-6">
            <div className="mb-9 space-y-1">
                <h2 className="sub-header">Medical Information</h2>
            </div>
        </section>
        <CustomFormField 
            fieldType={FormFieldType.SELECT}
            control={form.control}
            name='primaryPhysician'
            label='Primary Physician'
            placeholder='Select a physician'
        >
            {Doctors.map((doctor) => (
                <SelectItem key={doctor.name} value={doctor.name}>
                    <div className="flex cursor-pointer items-center gap-2">
                        <Image
                            src={doctor.image}
                            height={34}
                            width={34}
                            alt={doctor.name}
                            className="rounded-full border border-dark-500"
                        />
                        <p>{doctor.name}</p>
                    </div>
                </SelectItem>
            ))}
        </CustomFormField>
        <div className="flex flex-col gap-6 xl:flex-row">
        <CustomFormField 
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name='insuranceProvider'
            label='Insurance Provider'
            placeholder='Max Insurance'
        />
        <CustomFormField 
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name='insurancePolicyNumber'
            label='Insurance Policy Number'
            placeholder='ABC123456789'
        />
        </div>
        <div className="flex flex-col gap-6 xl:flex-row">
        <CustomFormField 
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name='allergies'
            label='Allergies (if any)'
            placeholder='Peanuts, Penicillin, Pollen'
        />
        <CustomFormField 
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name='currentMedication'
            label='Current Medication (if any)'
            placeholder='Ibuprofen 200mg, Paracetamol 500mg'
        />
        </div>
        <div className="flex flex-col gap-6 xl:flex-row">
        <CustomFormField 
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name='familyMedicalHistory'
            label='Family Medical History'
            placeholder='Mother had brain cancer, father had a heart disease'
        />
        <CustomFormField 
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name='pastMedicalHistory'
            label='Past Medical History'
            placeholder='Appendectomy, Tonsillectomy'
        />
        </div>
        <section className="space-y-6">
            <div className="mb-9 space-y-1">
                <h2 className="sub-header">Identification and Verification</h2>
            </div>
        </section>
        <CustomFormField 
            fieldType={FormFieldType.SELECT}
            control={form.control}
            name='identificationType'
            label='Identification Type'
            placeholder='Select an Identification type'
            >
            {IdentificationTypes.map((type) => (
                <SelectItem key={type} value={type}>
                    {type}
                </SelectItem>
            ))}
        </CustomFormField>
        <CustomFormField 
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name='identificationNumber'
            label='Identification Number'
            placeholder='123456789'
            />
        <CustomFormField
            fieldType={FormFieldType.SKELETON}
            control={form.control}
            name="identificationDocument"
            label="Scanned copy of identification document"
            renderSkeleton={(field) => (
                <FormControl>
                    <FileUploader 
                        files={field.value}
                        onChange={field.onChange}
                    />
                </FormControl>
            )}
        />
        <section className="space-y-6">
            <div className="mb-9 space-y-1">
                <h2 className="sub-header">Consent and Privacy</h2>
            </div>
        </section>
          <CustomFormField
            fieldType={FormFieldType.CHECKBOX}
            control={form.control}
            name="treatmentConsent"
            label="I consent to receive treatment for my health condition."
          />
          <CustomFormField
            fieldType={FormFieldType.CHECKBOX}
            control={form.control}
            name="disclosureConsent"
            label="I consent to the use and disclosure of my health
            information for treatment purposes."
          />
          <CustomFormField
            fieldType={FormFieldType.CHECKBOX}
            control={form.control}
            name="privacyConsent"
            label="I acknowledge that I have reviewed and agree to the
            privacy policy"
          />
        <SubmitButton isLoading={isLoading}>Get Started</SubmitButton>
      </form>
    </Form>
  )}

export default RegisterForm