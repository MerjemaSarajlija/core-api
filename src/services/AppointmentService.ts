import { Appointment } from "@/entities/Appointment";
import { Doctor } from "@/entities/Doctor";
import { BookAppointmentInput } from "@/models/appointments/BookAppointmentInput";
import { Slot } from "@/models/appointments/Slot";
import addMinutes from "date-fns/addMinutes";
import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

@Service()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>
  ) {}

  async getAppointments(): Promise<Appointment[]> {
    return await this.appointmentRepo.find();
  }

  checkBusySlots(busyAppointments: Appointment[], slot: Slot) {
    const exists: Slot[] = [];
    const busySlots: Slot[] = [];
    busyAppointments?.map((item) => {
      const slot = new Slot();
      slot.start = item.startTime;
      slot.doctorId = item.doctorId;
      slot.end = addMinutes(item.startTime, 15);
      busySlots.push(slot);
    });

    busySlots?.map((element) => {
      if (
        element &&
        element.doctorId === slot.doctorId &&
        // element.start.getTime() == slot.start.getTime() &&
        slot.start.getTime() < element.end.getTime() &&
        slot.start.getTime() >= element.start.getTime()
      ) {
        exists.push(element);
      }
    });

    if (exists.length != 0) {
      return true;
    } else {
      return false;
    }
  }

  async bookAppointment(options: BookAppointmentInput): Promise<Appointment> {
    const { slot, patientName, description } = options;

    const busyAppointments = await this.getAppointments();
    const doctor = await this.doctorRepo.findOne({
      id: slot.doctorId,
    });
    if (!doctor) {
      throw new Error("Doctor does not exist");
    }
    if (this.checkBusySlots(busyAppointments, slot)) {
      throw new Error('Appointment slot already take');
    }
    const appointment = new Appointment();
    appointment.doctorId = slot.doctorId;
    appointment.patientName = patientName;
    appointment.description = description;
    appointment.startTime = slot.start;
    return await this.appointmentRepo.save(appointment);
  }
}
