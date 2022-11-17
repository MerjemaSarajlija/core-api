import { Availability } from "@/entities/Availability";
import { Doctor } from "@/entities/Doctor";
import { Slot } from "@/models/appointments/Slot";
import { AddAvailabilityInput } from "@/models/availability/addAvailabilityInput";
import { AddDoctorInput } from "@/models/doctor/AddDoctorInput";
import { NotImplementedException } from "@/models/errors/NotImplementedException";
import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import {
  isBefore,
  setHours,
  setMinutes,
  setSeconds,
  addMinutes,
  setMilliseconds,
  addDays,
} from "date-fns";
import { AppointmentService } from "./AppointmentService";
import { Appointment } from "@/entities/Appointment";

@Service()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
    @InjectRepository(Availability)
    private readonly avilabilityRepo: Repository<Availability>,
    private readonly appointmentService: AppointmentService
  ) {}

  async getDoctors() {
    return await this.doctorRepo.find();
  }

  async getDoctorById(id: number): Promise<Doctor> {
    return await this.doctorRepo.findOneOrFail({ id: id });
  }

  async getAllAvailability(): Promise<Availability[]> {
    return await this.avilabilityRepo.find();
  }

  async addDoctor(item: AddDoctorInput): Promise<Doctor> {
    const newDoctor = new Doctor();
    newDoctor.name = item.name;

    return await this.doctorRepo.save(newDoctor);
  }

  async addAvailability(
    availability: AddAvailabilityInput
  ): Promise<Availability> {
    const newAvailability = new Availability();
    const doctor = await this.getDoctorById(availability.doctor);
    newAvailability.dayOfWeek = availability.dayOfWeek;
    newAvailability.startTimeUtc = availability.startTimeUtc;
    newAvailability.endTimeUtc = availability.endTimeUtc;
    newAvailability.doctor = doctor;
    return await this.avilabilityRepo.save(newAvailability);
  }

  createSlots(
    start: Date,
    end: Date,
    doctorId: number,
    busyAppointments?: Appointment[]
  ): Slot[] {
    const step = (x: any) => addMinutes(x, 15);
    const blocks: Slot[] = [];
    const dates = [];
    let cursor = start;

    while (isBefore(cursor, end)) {
      dates.push(cursor);
      cursor = step(cursor);
    }
    dates.map((cursor) => {
      const slot = new Slot();
      slot.start = cursor;
      slot.end = addMinutes(cursor, 15);
      slot.doctorId = doctorId;

      const check = this.appointmentService.checkBusySlots(
        busyAppointments,
        slot
      );
      if (!check) {
        blocks.push(slot);
      }
    });

    return blocks;
  }

  checkDailyAvailability(availability: Availability, day: number): boolean {
    if (availability.dayOfWeek == day) {
      return true;
    } else {
      return false;
    }
  }
  async getAvailableSlots(from: Date, to: Date): Promise<Slot[]> {

    console.log("from")
    console.log(from)
    console.log("to")
    console.log(to)
    let slots: Slot[] = [];
    const getDoctors = await this.getDoctors();
    getDoctors.map((item) => {
      const id = item.id;
      const app = item.appointments;

      const dates = [];
      const step = (x: any) => addDays(x, 1);
      let cursor = from;
      while (isBefore(cursor, to)) {
        dates.push(cursor);
        cursor = step(cursor);
      }

      dates?.map((cursor) => {
        const day = cursor.getDay();
        const availability = item.availability;
        //   const avilabilityByDay = item.availability.filter(
        //     (av) => av.dayOfWeek == day
        //   );
        availability?.map((item) => {
          if (item.dayOfWeek == day) {
            const beginningHours = cursor.setHours(
              Number(item.startTimeUtc.split(":")[0]),
              Number(item.startTimeUtc.split(":")[1])
            );
            const endingHours = cursor.setHours(
              Number(item.endTimeUtc.split(":")[0]),
              Number(item.endTimeUtc.split(":")[1])
            );
            slots = slots.concat(
              this.createSlots(
                new Date(beginningHours),
                new Date(endingHours),
                id,
                app
              )
            );
          }
        });
      });
    });
    return slots;
  }
}
