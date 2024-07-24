/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import jsPDF from "jspdf";
import { CalendarIcon, Image as LucideImage } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "./components/ui/button";
import { Calendar } from "./components/ui/calendar";
import { Input } from "./components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { Textarea } from "./components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "./lib/utils";
import InputMask from "react-input-mask";

import { z } from "zod";

const stringToPhoneNumber = (str: string) => {
  if (str.length === 10) {
    return str.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return str.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

const PrescriptionFormSchema = z.object({
  patientName: z.string({ required_error: "Campo obrigatório" }).max(50, {
    message: "Máximo de 50 caracteres",
  }),
  address: z.string({ required_error: "Campo obrigatório" }).max(50, {
    message: "Máximo de 50 caracteres",
  }),
  age: z.preprocess(
    (a) => {
      if (typeof a === "number") return a;
      if (typeof a === "string" && a.length > 0) return parseInt(a, 10);
      if (typeof a === "string" && a.length === 0) return 0;
      return a;
    },
    z
      .number({ required_error: "Campo obrigatório" })
      .min(1, {
        message: "Idade inválida",
      })
      .max(120, {
        message: "Idade inválida",
      })
  ),
  date: z.date(),
  diagnosis: z.string({ required_error: "Campo obrigatório" }).max(100, {
    message: "Máximo de 100 caracteres",
  }),
  doctorGender: z.string().min(1, {
    message: "Campo obrigatório",
  }),
  doctorName: z.string({ required_error: "Campo obrigatório" }).max(11, {
    message: "Máximo de 11 caracteres",
  }),
  qualification: z.string({ required_error: "Campo obrigatório" }).max(50, {
    message: "Máximo de 50 caracteres",
  }),
  certification: z.string({ required_error: "Campo obrigatório" }).max(50, {
    message: "Máximo de 50 caracteres",
  }),
  obs: z.string({ required_error: "Campo obrigatório" }).max(1500),
  logo: z.custom<File>(),
  doctorPhone: z.preprocess(
    (a) => {
      if (typeof a === "string") {
        return a.replace(/[^0-9]/g, "");
      }
      return a;
    },
    z
      .string({ required_error: "Campo obrigatório" })
      .min(10, {
        message: "Telefone inválido",
      })
      .max(11, {
        message: "Telefone inválido",
      })
  ),

  doctorAddress: z.string({ required_error: "Campo obrigatório" }).max(150, {
    message: "Máximo de 150 caracteres",
  }),
  doctorEmail: z.string({ required_error: "Campo obrigatório" }).email({
    message: "Email inválido",
  }),
});

type PrescriptionFormInputs = z.infer<typeof PrescriptionFormSchema>;

const PrescriptionForm: React.FC = () => {
  const storageDoctorInfo = localStorage.getItem("doctorInfo")
    ? JSON.parse(localStorage.getItem("doctorInfo") as string)
    : null;

  const form = useForm<PrescriptionFormInputs>({
    resolver: zodResolver(PrescriptionFormSchema),
    defaultValues: {
      doctorGender: storageDoctorInfo?.doctorGender || "",
      doctorName: storageDoctorInfo?.doctorName || "",
      qualification: storageDoctorInfo?.qualification || "",
      certification: storageDoctorInfo?.certification || "",
      date: new Date(),
      doctorAddress: storageDoctorInfo?.doctorAddress || "",
      doctorEmail: storageDoctorInfo?.doctorEmail || "",
      doctorPhone: storageDoctorInfo?.doctorPhone || "",
    },
  });
  const { handleSubmit, control } = form;
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const storeDoctorInfo = (data: PrescriptionFormInputs) => {
    localStorage.setItem("doctorInfo", JSON.stringify(data));
  };

  const onSubmit = (data: PrescriptionFormInputs) => {
    storeDoctorInfo(data);
    const doc = new jsPDF();

    const backgroundImage = `/prescription.png`;

    const img = new Image();
    img.src = backgroundImage;
    img.onload = () => {
      doc.addImage(img, "JPEG", 0, 0, 210, 297);

      if (logoUrl) {
        doc.addImage(logoUrl, "PNG", 24, 268, 45, 23);
      }

      doc.setFontSize(36);
      doc.setTextColor(87, 124, 184);
      doc.setFont("Helvetica", "Bold");
      doc.text(`${data.doctorGender} ${data.doctorName}`, 15, 22);

      doc.setFont("Helvetica", "normal");
      doc.setTextColor(22, 46, 53);
      doc.setFontSize(18);
      doc.text(`${data.qualification}`, 15, 30);

      doc.setFontSize(12);
      doc.setTextColor(92, 102, 106);
      doc.text(`${data.certification}`, 16, 48);

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);

      doc.text(`${data.patientName}`, 53, 66);
      doc.text(`${data.address}`, 36, 75);
      doc.text(`${data.age}`, 30, 85);
      doc.text(`${data.diagnosis}`, 41, 94);
      doc.text(`${format(data.date, "PPP", { locale: ptBR })}`, 101, 85);
      const str = doc.splitTextToSize(`${data.obs}`, 180);
      doc.text(str, 15, 135);

      console.log(doc.getFontList());
      doc.setFontSize(10);
      doc.setTextColor(84, 97, 106);
      const address = doc.splitTextToSize(`${data.doctorAddress}`, 115);
      let coordinates = {
        x: 88,
        y: 288,
      };

      if (data.doctorAddress.length > 60) {
        coordinates = {
          x: 88,
          y: 286,
        };
      }

      doc.text(address, coordinates.x, coordinates.y);

      doc.text(stringToPhoneNumber(data.doctorPhone), 88, 275);

      doc.text(`${data.doctorEmail}`, 155, 275);

      const nameDoc = `${data.patientName} - ${format(data.date, "PPP", {
        locale: ptBR,
      })}`;
      doc.save(`${nameDoc}.pdf`);
    };
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoUrl(e.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 pb-4"
      >
        <div>
          <div className="flex flex-col sm:flex-row  mt-1 gap-4">
            <FormField
              name="doctorGender"
              control={control}
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Prefixo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl ref={field.ref}>
                        <SelectTrigger className={`w-full sm:w-28 `}>
                          <SelectValue placeholder="Dr. / Dr.a" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Dr.">Dr.</SelectItem>
                        <SelectItem value="Dra.">Dra.</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              name="doctorName"
              control={control}
              render={({ field }) => {
                return (
                  <FormItem className="w-full">
                    <FormLabel>Nome</FormLabel>
                    <Input {...field} />
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row  mt-1 gap-4">
          <FormField
            name="doctorPhone"
            control={control}
            render={({ field }) => {
              const value = field.value;
              const mask =
                value.charAt(5) === "9" ? "(99) 99999-9999" : "(99) 9999-9999";

              return (
                <FormItem className="w-full">
                  <FormLabel>Telefone</FormLabel>
                  <InputMask
                    mask={mask}
                    value={field.value}
                    onChange={field.onChange}
                  >
                    {/* @ts-ignore */}
                    {() => <Input ref={field.ref} />}
                  </InputMask>

                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            name="doctorEmail"
            control={control}
            render={({ field }) => {
              return (
                <FormItem className="w-full">
                  <FormLabel>Email</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>
        <div>
          <FormField
            name="doctorAddress"
            control={control}
            render={({ field }) => {
              return (
                <FormItem className="w-full">
                  <FormLabel>Endereço</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>
        <div className="flex flex-col sm:flex-row  mt-1 gap-4">
          <FormField
            name="qualification"
            control={control}
            render={({ field }) => {
              return (
                <FormItem className="w-full">
                  <FormLabel>Qualificação</FormLabel>
                  <Input
                    {...field}
                    placeholder="Dentista, Oncologista, Neurologista..."
                  />
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            name="certification"
            control={control}
            render={({ field }) => {
              return (
                <FormItem className="w-full">
                  <FormLabel>Certificação</FormLabel>
                  <Input
                    {...field}
                    placeholder="CRM: 123456-7, CRO: 123456-7"
                  />
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>
        <div className="flex flex-col sm:flex-row  mt-1 gap-4">
          <FormField
            name="patientName"
            control={control}
            render={({ field }) => {
              return (
                <FormItem className="w-full">
                  <FormLabel> Nome do/da paciente</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            name="age"
            control={control}
            render={({ field }) => {
              return (
                <FormItem className="w-full">
                  <FormLabel>Idade</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>
        <div>
          <FormField
            name="address"
            control={control}
            render={({ field }) => {
              return (
                <FormItem className="w-full">
                  <FormLabel>Endereço</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        <div>
          <FormField
            control={control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de atendimento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      locale={ptBR}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <FormField
            name="diagnosis"
            control={control}
            render={({ field }) => {
              return (
                <FormItem className="w-full">
                  <FormLabel>Diagnóstico</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>
        <div>
          <FormField
            name="obs"
            control={control}
            rules={{ required: true, maxLength: 1500 }}
            render={({ field }) => {
              return (
                <FormItem className="w-full">
                  <FormLabel>Observação / posologia / etc...</FormLabel>
                  <Textarea {...field} />
                  <FormDescription
                    className={`${
                      field.value?.length > 1500 ? "text-red-400" : ""
                    }`}
                  >
                    {field.value?.length || 0} / 1500
                  </FormDescription>
                </FormItem>
              );
            }}
          />
        </div>
        <div>
          <FormField
            name="logo"
            control={control}
            render={({ field }) => {
              return (
                <FormItem className="w-full">
                  <FormLabel>Adicionar Logo</FormLabel>
                  <div className="flex items-center mt-1">
                    <LucideImage className="mr-2" />

                    <Input
                      type="file"
                      accept="image/*"
                      ref={field.ref}
                      onChange={handleLogoChange}
                      className="file:text-foreground"
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>
        <Button type="submit" className="mt-4">
          Gerar prescrição
        </Button>
      </form>
    </Form>
  );
};

export default PrescriptionForm;
